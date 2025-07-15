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
        Schema::create('user_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('workspace_id');
            $table->string('module');
            $table->string('action');
            $table->decimal('current_value', 10, 2)->default(0);
            $table->decimal('target_value', 10, 2)->default(100);
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->integer('streak_count')->default(0);
            $table->timestamp('last_activity')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            
            $table->unique(['user_id', 'workspace_id', 'module', 'action']);
            $table->index(['user_id', 'workspace_id']);
            $table->index(['module', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_progress');
    }
};