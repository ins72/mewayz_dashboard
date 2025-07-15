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
        Schema::create('content_calendars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('calendar_type', ['monthly', 'weekly', 'campaign', 'event'])->default('monthly');
            $table->enum('status', ['active', 'inactive', 'completed', 'draft'])->default('draft');
            $table->json('content_themes')->nullable();
            $table->json('publishing_schedule')->nullable();
            $table->json('campaign_goals')->nullable();
            $table->json('target_audience')->nullable();
            $table->json('hashtag_strategy')->nullable();
            $table->json('content_pillars')->nullable();
            $table->uuid('created_by');
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->index(['workspace_id', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_calendars');
    }
};