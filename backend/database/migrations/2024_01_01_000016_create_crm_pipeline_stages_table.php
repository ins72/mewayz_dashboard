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
        Schema::create('crm_pipeline_stages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('order');
            $table->string('color', 7)->default('#3b82f6');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_closing_stage')->default(false);
            $table->integer('probability')->default(50);
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->index(['workspace_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_pipeline_stages');
    }
};