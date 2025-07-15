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
        Schema::create('marketing_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->enum('metric_type', ['count', 'percentage', 'currency', 'duration']);
            $table->string('metric_name');
            $table->decimal('metric_value', 15, 2);
            $table->json('metric_data')->nullable();
            $table->enum('channel', ['email', 'social', 'content', 'paid', 'organic', 'referral', 'direct']);
            $table->uuid('campaign_id')->nullable();
            $table->uuid('content_id')->nullable();
            $table->date('date_recorded');
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('campaign_id')->references('id')->on('email_campaigns')->onDelete('set null');
            $table->foreign('content_id')->references('id')->on('marketing_contents')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'metric_type']);
            $table->index(['channel']);
            $table->index(['date_recorded']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_analytics');
    }
};