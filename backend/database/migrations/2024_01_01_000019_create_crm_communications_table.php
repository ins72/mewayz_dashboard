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
        Schema::create('crm_communications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('contact_id');
            $table->uuid('deal_id')->nullable();
            $table->enum('type', ['call', 'email', 'meeting', 'sms', 'social', 'other'])->default('email');
            $table->enum('direction', ['inbound', 'outbound']);
            $table->string('subject');
            $table->text('content')->nullable();
            $table->text('summary')->nullable();
            $table->integer('duration')->nullable(); // in minutes
            $table->string('outcome')->nullable();
            $table->text('next_action')->nullable();
            $table->uuid('created_by');
            $table->datetime('scheduled_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->json('custom_fields')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('contact_id')->references('id')->on('crm_contacts')->onDelete('cascade');
            $table->foreign('deal_id')->references('id')->on('crm_deals')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'type']);
            $table->index(['contact_id']);
            $table->index(['deal_id']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_communications');
    }
};