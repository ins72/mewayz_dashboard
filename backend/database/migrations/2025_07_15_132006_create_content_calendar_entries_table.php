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
        Schema::create('content_calendar_entries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('content_calendar_id');
            $table->uuid('workspace_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('content_type', ['post', 'story', 'reel', 'igtv', 'live'])->default('post');
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->enum('platform', ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'])->default('instagram');
            $table->json('content_data')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'published', 'failed'])->default('draft');
            $table->uuid('created_by');
            $table->json('tags')->nullable();
            $table->json('media_urls')->nullable();
            $table->json('hashtags')->nullable();
            $table->json('target_audience')->nullable();
            $table->uuid('campaign_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('content_calendar_id')->references('id')->on('content_calendars')->onDelete('cascade');
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->index(['content_calendar_id', 'scheduled_date']);
            $table->index(['workspace_id', 'scheduled_date']);
            $table->index(['status', 'scheduled_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_calendar_entries');
    }
};
