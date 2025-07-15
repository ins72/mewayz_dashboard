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
        Schema::create('marketing_contents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('content_type', ['blog_post', 'ebook', 'whitepaper', 'case_study', 'video', 'podcast', 'infographic']);
            $table->enum('format', ['html', 'pdf', 'video', 'audio', 'image']);
            $table->string('content_url')->nullable();
            $table->json('content_data')->nullable();
            $table->enum('status', ['draft', 'scheduled', 'published'])->default('draft');
            $table->integer('views')->default(0);
            $table->integer('downloads')->default(0);
            $table->decimal('engagement_score', 5, 2)->default(0.0);
            $table->json('seo_keywords')->nullable();
            $table->string('meta_description')->nullable();
            $table->datetime('scheduled_at')->nullable();
            $table->datetime('published_at')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['content_type']);
            $table->index(['published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_contents');
    }
};