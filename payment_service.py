from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import logging
from datetime import datetime
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Initialize Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "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")

# Subscription packages (predefined to prevent price manipulation)
SUBSCRIPTION_PACKAGES = {
    "basic": {"amount": 29.99, "currency": "usd", "name": "Basic Plan", "features": ["5 Workspaces", "Basic Support", "Social Media Tools"]},
    "professional": {"amount": 79.99, "currency": "usd", "name": "Professional Plan", "features": ["15 Workspaces", "Priority Support", "Advanced Analytics", "CRM Tools"]},
    "enterprise": {"amount": 199.99, "currency": "usd", "name": "Enterprise Plan", "features": ["Unlimited Workspaces", "24/7 Support", "Custom Integrations", "API Access"]},
}

# Pydantic models
class PaymentRequest(BaseModel):
    package_id: str
    origin_url: str
    user_id: Optional[str] = None
    workspace_id: Optional[str] = None
    
class PaymentTransaction(BaseModel):
    id: str
    user_id: Optional[str]
    workspace_id: Optional[str]
    package_id: str
    amount: float
    currency: str
    session_id: str
    payment_status: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

# Mock database for payment transactions (in production, use proper database)
payment_transactions = {}

def get_stripe_checkout(request: Request) -> StripeCheckout:
    """Initialize Stripe checkout with webhook URL"""
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_SECRET_KEY, webhook_url=webhook_url)

@app.post("/api/payments/v1/checkout/session")
async def create_checkout_session(payment_request: PaymentRequest, request: Request):
    """Create a Stripe checkout session for subscription payment"""
    try:
        # Validate package
        if payment_request.package_id not in SUBSCRIPTION_PACKAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid package ID"
            )
        
        package = SUBSCRIPTION_PACKAGES[payment_request.package_id]
        
        # Initialize Stripe checkout
        stripe_checkout = get_stripe_checkout(request)
        
        # Build success and cancel URLs
        success_url = f"{payment_request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{payment_request.origin_url}/payment/cancel"
        
        # Create metadata
        metadata = {
            "package_id": payment_request.package_id,
            "user_id": payment_request.user_id or "anonymous",
            "workspace_id": payment_request.workspace_id or "",
            "payment_type": "subscription",
            "package_name": package["name"]
        }
        
        # Create checkout session request
        checkout_request = CheckoutSessionRequest(
            amount=package["amount"],
            currency=package["currency"],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        # Create checkout session
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store transaction in database
        transaction_id = f"txn_{session.session_id}"
        payment_transactions[transaction_id] = {
            "id": transaction_id,
            "user_id": payment_request.user_id,
            "workspace_id": payment_request.workspace_id,
            "package_id": payment_request.package_id,
            "amount": package["amount"],
            "currency": package["currency"],
            "session_id": session.session_id,
            "payment_status": "pending",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "metadata": metadata
        }
        
        logger.info(f"Created checkout session: {session.session_id} for package: {payment_request.package_id}")
        
        return {
            "success": True,
            "url": session.url,
            "session_id": session.session_id,
            "transaction_id": transaction_id,
            "package": package
        }
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )

@app.get("/api/payments/v1/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """Get the status of a checkout session"""
    try:
        # Initialize Stripe checkout
        stripe_checkout = get_stripe_checkout(request)
        
        # Get status from Stripe
        status_response: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Find transaction in database
        transaction = None
        for txn in payment_transactions.values():
            if txn["session_id"] == session_id:
                transaction = txn
                break
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )
        
        # Update transaction status if payment is complete
        if status_response.payment_status == "paid" and transaction["payment_status"] != "paid":
            transaction["payment_status"] = "paid"
            transaction["updated_at"] = datetime.now()
            
            # Here you would typically:
            # 1. Activate the user's subscription
            # 2. Send confirmation email
            # 3. Update user's workspace limits
            logger.info(f"Payment completed for session: {session_id}")
            
        elif status_response.status == "expired":
            transaction["payment_status"] = "expired"
            transaction["updated_at"] = datetime.now()
            
        return {
            "success": True,
            "status": status_response.status,
            "payment_status": status_response.payment_status,
            "amount_total": status_response.amount_total,
            "currency": status_response.currency,
            "metadata": status_response.metadata,
            "transaction": transaction
        }
        
    except Exception as e:
        logger.error(f"Error getting checkout status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get checkout status: {str(e)}"
        )

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        # Get request body and signature
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Initialize Stripe checkout
        stripe_checkout = get_stripe_checkout(request)
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook event
        if webhook_response.event_type == "checkout.session.completed":
            # Find transaction
            transaction = None
            for txn in payment_transactions.values():
                if txn["session_id"] == webhook_response.session_id:
                    transaction = txn
                    break
            
            if transaction:
                transaction["payment_status"] = "paid"
                transaction["updated_at"] = datetime.now()
                
                # Process successful payment
                await process_successful_payment(transaction)
                
                logger.info(f"Webhook processed: Payment completed for session {webhook_response.session_id}")
        
        return JSONResponse(content={"success": True}, status_code=200)
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )

async def process_successful_payment(transaction: Dict[str, Any]):
    """Process successful payment and activate subscription"""
    try:
        # Here you would typically:
        # 1. Update user's subscription status
        # 2. Update workspace limits
        # 3. Send confirmation email
        # 4. Log the successful payment
        
        logger.info(f"Processing successful payment for transaction: {transaction['id']}")
        
        # Mock processing
        package_id = transaction["package_id"]
        package = SUBSCRIPTION_PACKAGES[package_id]
        
        # Update user's subscription (mock)
        logger.info(f"Activated {package['name']} subscription for user {transaction['user_id']}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error processing successful payment: {str(e)}")
        return False

@app.get("/api/payments/v1/packages")
async def get_subscription_packages():
    """Get available subscription packages"""
    return {
        "success": True,
        "packages": SUBSCRIPTION_PACKAGES
    }

@app.get("/api/payments/v1/transactions")
async def get_transactions(user_id: Optional[str] = None):
    """Get payment transactions for a user"""
    try:
        transactions = list(payment_transactions.values())
        
        if user_id:
            transactions = [t for t in transactions if t["user_id"] == user_id]
        
        return {
            "success": True,
            "transactions": transactions
        }
        
    except Exception as e:
        logger.error(f"Error getting transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transactions: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)