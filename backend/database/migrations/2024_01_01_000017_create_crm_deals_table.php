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
        Schema::create('crm_deals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('contact_id');
            $table->uuid('pipeline_stage_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('value', 15, 2);
            $table->integer('probability')->default(50);
            $table->date('expected_close_date')->nullable();
            $table->date('actual_close_date')->nullable();
            $table->enum('status', ['active', 'won', 'lost'])->default('active');
            $table->string('source')->nullable();
            $table->json('custom_fields')->nullable();
            $table->uuid('created_by');
            $table->uuid('assigned_to')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('contact_id')->references('id')->on('crm_contacts')->onDelete('cascade');
            $table->foreign('pipeline_stage_id')->references('id')->on('crm_pipeline_stages')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['contact_id']);
            $table->index(['pipeline_stage_id']);
            $table->index(['assigned_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_deals');
    }
};