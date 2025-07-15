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
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->uuid('role_id')->nullable()->after('role');
            $table->uuid('invited_by')->nullable()->after('role_id');
            $table->timestamp('last_activity_at')->nullable()->after('joined_at');
            
            $table->foreign('role_id')->references('id')->on('team_roles')->onDelete('set null');
            $table->foreign('invited_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['invited_by']);
            $table->dropColumn(['role_id', 'invited_by', 'last_activity_at']);
        });
    }
};
