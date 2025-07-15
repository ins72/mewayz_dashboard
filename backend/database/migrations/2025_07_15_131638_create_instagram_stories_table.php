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
        Schema::create('instagram_stories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('social_media_account_id');
            $table->string('title')->nullable();
            $table->text('content');
            $table->text('media_url')->nullable();
            $table->enum('story_type', ['photo', 'video', 'carousel', 'text'])->default('photo');
            $table->enum('status', ['draft', 'scheduled', 'published', 'failed', 'expired'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->string('external_story_id')->nullable();
            $table->integer('duration')->default(24); // Duration in hours
            $table->json('engagement_metrics')->nullable();
            $table->uuid('created_by');
            $table->boolean('is_highlight')->default(false);
            $table->string('highlight_category')->nullable();
            $table->json('stickers')->nullable();
            $table->json('links')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('social_media_account_id')->references('id')->on('social_media_accounts')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instagram_stories');
    }
};