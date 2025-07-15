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
        Schema::create('templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id')->nullable();
            $table->uuid('creator_id');
            $table->uuid('template_category_id');
            $table->string('title');
            $table->text('description');
            $table->enum('template_type', ['email', 'link_in_bio', 'course', 'social_media', 'marketing', 'landing_page', 'newsletter', 'blog_post'])->default('email');
            $table->json('template_data');
            $table->string('preview_image')->nullable();
            $table->string('preview_url')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->boolean('is_free')->default(false);
            $table->boolean('is_premium')->default(false);
            $table->enum('status', ['active', 'inactive', 'draft', 'archived'])->default('draft');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('version')->default('1.0');
            $table->json('tags')->nullable();
            $table->json('features')->nullable();
            $table->json('requirements')->nullable();
            $table->enum('license_type', ['standard', 'extended', 'commercial', 'unlimited'])->default('standard');
            $table->integer('usage_limit')->default(0);
            $table->integer('download_count')->default(0);
            $table->integer('purchase_count')->default(0);
            $table->decimal('rating_average', 3, 2)->default(0.00);
            $table->integer('rating_count')->default(0);
            $table->uuid('created_by');
            $table->uuid('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('creator_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('template_category_id')->references('id')->on('template_categories')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index(['template_type', 'status', 'approval_status']);
            $table->index(['template_category_id', 'status']);
            $table->index(['creator_id', 'status']);
            $table->index(['is_free', 'status']);
            $table->index(['is_premium', 'status']);
            $table->index(['rating_average', 'rating_count']);
            $table->index(['download_count', 'purchase_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};