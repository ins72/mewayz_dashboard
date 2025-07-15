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
        Schema::create('competitor_analyses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('competitor_username');
            $table->string('competitor_name')->nullable();
            $table->enum('platform', ['instagram', 'twitter', 'facebook', 'linkedin', 'tiktok'])->default('instagram');
            $table->bigInteger('follower_count')->default(0);
            $table->bigInteger('following_count')->default(0);
            $table->bigInteger('posts_count')->default(0);
            $table->decimal('engagement_rate', 5, 2)->default(0.00);
            $table->decimal('average_likes', 10, 2)->default(0.00);
            $table->decimal('average_comments', 10, 2)->default(0.00);
            $table->decimal('posting_frequency', 5, 2)->default(0.00); // posts per day
            $table->json('content_themes')->nullable();
            $table->json('hashtag_usage')->nullable();
            $table->json('best_performing_content')->nullable();
            $table->json('posting_schedule')->nullable();
            $table->decimal('growth_rate', 5, 2)->default(0.00);
            $table->timestamp('last_analyzed');
            $table->enum('tracking_status', ['active', 'inactive', 'paused'])->default('active');
            $table->json('competitor_metrics')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->unique(['workspace_id', 'competitor_username', 'platform']);
            $table->index(['workspace_id', 'platform']);
            $table->index(['tracking_status', 'platform']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('competitor_analyses');
    }
};