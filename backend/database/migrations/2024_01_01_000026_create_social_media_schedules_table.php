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
        Schema::create('social_media_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('content_id')->nullable();
            $table->text('post_content');
            $table->json('platforms');
            $table->datetime('scheduled_at');
            $table->enum('status', ['scheduled', 'published', 'cancelled', 'failed'])->default('scheduled');
            $table->integer('engagement_forecast')->nullable();
            $table->integer('actual_engagement')->nullable();
            $table->json('media_urls')->nullable();
            $table->json('hashtags')->nullable();
            $table->json('mentions')->nullable();
            $table->uuid('campaign_id')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('content_id')->references('id')->on('marketing_contents')->onDelete('set null');
            $table->foreign('campaign_id')->references('id')->on('email_campaigns')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['scheduled_at']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_media_schedules');
    }
};