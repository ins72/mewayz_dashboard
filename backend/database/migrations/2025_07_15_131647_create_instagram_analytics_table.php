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
        Schema::create('instagram_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('social_media_account_id');
            $table->date('date');
            $table->json('account_metrics')->nullable(); // followers, following, posts, engagement_rate
            $table->json('post_metrics')->nullable(); // likes, comments, shares, reach, impressions
            $table->json('story_metrics')->nullable(); // views, taps, replies, exits
            $table->json('audience_metrics')->nullable(); // demographics, location, interests
            $table->json('hashtag_performance')->nullable(); // hashtag effectiveness
            $table->json('best_posting_times')->nullable(); // optimal posting schedule
            $table->json('competitor_data')->nullable(); // competitor comparison
            $table->json('growth_metrics')->nullable(); // growth trends
            $table->json('engagement_insights')->nullable(); // engagement patterns
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('social_media_account_id')->references('id')->on('social_media_accounts')->onDelete('cascade');
            $table->unique(['workspace_id', 'social_media_account_id', 'date']);
            $table->index(['workspace_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instagram_analytics');
    }
};