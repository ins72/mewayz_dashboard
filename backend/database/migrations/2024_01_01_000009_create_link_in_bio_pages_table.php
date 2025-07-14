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
        Schema::create('link_in_bio_pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('profile_image')->nullable();
            $table->string('background_image')->nullable();
            $table->json('theme_settings')->nullable();
            $table->json('links')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('custom_domain')->nullable();
            $table->integer('total_views')->default(0);
            $table->integer('total_clicks')->default(0);
            $table->uuid('created_by');
            $table->timestamps();
            
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('link_in_bio_pages');
    }
};