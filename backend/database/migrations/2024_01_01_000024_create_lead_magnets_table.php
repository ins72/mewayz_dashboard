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
        Schema::create('lead_magnets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['ebook', 'whitepaper', 'checklist', 'template', 'course', 'webinar', 'toolkit']);
            $table->string('file_url')->nullable();
            $table->string('landing_page_url')->nullable();
            $table->string('thank_you_page_url')->nullable();
            $table->enum('status', ['active', 'inactive', 'paused'])->default('active');
            $table->integer('views')->default(0);
            $table->integer('conversions')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0.0);
            $table->string('traffic_source')->nullable();
            $table->uuid('email_template_id')->nullable();
            $table->json('auto_tag')->nullable();
            $table->integer('lead_score_boost')->default(10);
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('email_template_id')->references('id')->on('email_templates')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['type']);
            $table->index(['traffic_source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_magnets');
    }
};