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
        Schema::create('marketing_automations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger', ['contact_created', 'email_opened', 'link_clicked', 'form_submitted', 'cart_abandoned', 'purchase_made']);
            $table->json('trigger_conditions')->nullable();
            $table->json('steps');
            $table->enum('status', ['active', 'inactive', 'paused'])->default('active');
            $table->integer('active_contacts')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0.0);
            $table->integer('total_runs')->default(0);
            $table->datetime('last_run_at')->nullable();
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['trigger']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_automations');
    }
};