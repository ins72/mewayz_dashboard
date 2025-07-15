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
        Schema::create('hashtag_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('hashtag');
            $table->enum('platform', ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'])->default('instagram');
            $table->bigInteger('post_count')->default(0);
            $table->decimal('engagement_rate', 5, 2)->default(0.00);
            $table->decimal('trending_score', 5, 2)->default(0.00);
            $table->decimal('difficulty_score', 5, 2)->default(0.00);
            $table->json('related_hashtags')->nullable();
            $table->string('category')->nullable();
            $table->timestamp('last_updated');
            $table->boolean('is_trending')->default(false);
            $table->integer('popularity_rank')->nullable();
            $table->json('usage_metrics')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->index(['workspace_id', 'platform']);
            $table->index(['hashtag', 'platform']);
            $table->index(['is_trending', 'platform']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hashtag_analytics');
    }
};