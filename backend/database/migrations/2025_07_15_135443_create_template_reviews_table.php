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
        Schema::create('template_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('template_id')->nullable();
            $table->uuid('template_collection_id')->nullable();
            $table->uuid('user_id');
            $table->uuid('workspace_id');
            $table->integer('rating');
            $table->string('title')->nullable();
            $table->text('review');
            $table->json('pros')->nullable();
            $table->json('cons')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->integer('helpful_count')->default(0);
            $table->integer('reported_count')->default(0);
            $table->enum('status', ['pending', 'active', 'hidden', 'removed'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('template_id')->references('id')->on('templates')->onDelete('cascade');
            $table->foreign('template_collection_id')->references('id')->on('template_collections')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            
            $table->index(['template_id', 'status', 'is_approved']);
            $table->index(['template_collection_id', 'status', 'is_approved']);
            $table->index(['user_id', 'status']);
            $table->index(['rating', 'status']);
            $table->index(['is_verified_purchase', 'status']);
            $table->index(['helpful_count', 'status']);
            $table->index(['reviewed_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_reviews');
    }
};