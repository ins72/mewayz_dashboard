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
        Schema::create('template_purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('template_id')->nullable();
            $table->uuid('template_collection_id')->nullable();
            $table->uuid('user_id');
            $table->uuid('workspace_id');
            $table->enum('purchase_type', ['template', 'collection', 'bundle'])->default('template');
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('total_amount', 10, 2)->default(0.00);
            $table->string('currency', 3)->default('USD');
            $table->string('payment_method')->nullable();
            $table->string('payment_id')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->enum('license_type', ['standard', 'extended', 'commercial', 'unlimited'])->default('standard');
            $table->integer('usage_limit')->default(0);
            $table->integer('usage_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('purchased_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('template_id')->references('id')->on('templates')->onDelete('cascade');
            $table->foreign('template_collection_id')->references('id')->on('template_collections')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            
            $table->index(['user_id', 'status']);
            $table->index(['workspace_id', 'status']);
            $table->index(['template_id', 'status']);
            $table->index(['template_collection_id', 'status']);
            $table->index(['purchase_type', 'status']);
            $table->index(['purchased_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_purchases');
    }
};