<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add user_id field
            $table->uuid('user_id')->after('workspace_id');
            
            // Add package_id field (equivalent to plan)
            $table->string('package_id')->after('user_id');
            
            // Add quantity field for feature count
            $table->integer('quantity')->default(1)->after('currency');
            
            // Add metadata field for additional data
            $table->json('metadata')->nullable()->after('features');
            
            // Add stripe customer id
            $table->string('stripe_customer_id')->nullable()->after('stripe_subscription_id');
            
            // Add cancelled_at field
            $table->timestamp('cancelled_at')->nullable()->after('trial_ends_at');
            
            // Add indexes
            $table->index('user_id');
            $table->index('package_id');
            $table->index('status');
            $table->index('stripe_subscription_id');
            $table->index('stripe_customer_id');
            
            // Add foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['package_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['stripe_subscription_id']);
            $table->dropIndex(['stripe_customer_id']);
            
            $table->dropColumn([
                'user_id',
                'package_id',
                'quantity',
                'metadata',
                'stripe_customer_id',
                'cancelled_at'
            ]);
        });
    }
};
