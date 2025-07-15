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
        Schema::create('template_usages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('template_id');
            $table->uuid('template_purchase_id')->nullable();
            $table->uuid('user_id');
            $table->uuid('workspace_id');
            $table->enum('usage_type', ['creation', 'customization', 'export', 'preview', 'download'])->default('creation');
            $table->enum('usage_context', ['email_campaign', 'link_in_bio', 'social_media_post', 'course_content', 'marketing_material', 'landing_page', 'other'])->default('other');
            $table->string('project_name')->nullable();
            $table->uuid('project_id')->nullable();
            $table->json('customizations')->nullable();
            $table->json('output_data')->nullable();
            $table->integer('usage_duration')->nullable(); // in seconds
            $table->decimal('success_rate', 5, 2)->nullable();
            $table->integer('feedback_rating')->nullable();
            $table->text('feedback_comment')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('template_id')->references('id')->on('templates')->onDelete('cascade');
            $table->foreign('template_purchase_id')->references('id')->on('template_purchases')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            
            $table->index(['template_id', 'usage_type']);
            $table->index(['user_id', 'usage_type']);
            $table->index(['workspace_id', 'usage_type']);
            $table->index(['usage_context', 'used_at']);
            $table->index(['feedback_rating', 'used_at']);
            $table->index(['success_rate', 'used_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_usages');
    }
};