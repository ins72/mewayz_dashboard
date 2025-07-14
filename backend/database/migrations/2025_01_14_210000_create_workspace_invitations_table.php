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
        Schema::create('workspace_invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('invited_by');
            $table->string('email');
            $table->string('role')->default('member');
            $table->string('department')->nullable();
            $table->string('position')->nullable();
            $table->text('personal_message')->nullable();
            $table->string('token')->unique();
            $table->enum('status', ['pending', 'accepted', 'declined', 'cancelled', 'expired'])->default('pending');
            $table->timestamp('expires_at');
            $table->integer('reminders_sent')->default(0);
            $table->text('declined_reason')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('invited_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['workspace_id', 'status']);
            $table->index(['token', 'status']);
            $table->index(['email', 'workspace_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workspace_invitations');
    }
};