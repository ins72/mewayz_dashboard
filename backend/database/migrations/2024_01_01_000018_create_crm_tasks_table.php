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
        Schema::create('crm_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('contact_id')->nullable();
            $table->uuid('deal_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['call', 'email', 'meeting', 'task', 'follow_up', 'other'])->default('task');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->datetime('due_date');
            $table->datetime('completed_at')->nullable();
            $table->uuid('created_by');
            $table->uuid('assigned_to');
            $table->json('custom_fields')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('contact_id')->references('id')->on('crm_contacts')->onDelete('cascade');
            $table->foreign('deal_id')->references('id')->on('crm_deals')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['contact_id']);
            $table->index(['deal_id']);
            $table->index(['assigned_to']);
            $table->index(['due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_tasks');
    }
};