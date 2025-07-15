<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing views that depend on workspace_members table
        DB::statement('DROP VIEW IF EXISTS user_workspace_permissions');
        DB::statement('DROP VIEW IF EXISTS workspace_invitation_stats');
        DB::statement('DROP VIEW IF EXISTS invitation_analytics');
        
        // Add new columns to workspace_members table
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->uuid('role_id')->nullable()->after('role');
            $table->uuid('invited_by')->nullable()->after('role_id');
            $table->timestamp('last_activity_at')->nullable()->after('joined_at');
            
            $table->foreign('role_id')->references('id')->on('team_roles')->onDelete('set null');
            $table->foreign('invited_by')->references('id')->on('users')->onDelete('set null');
        });
        
        // Recreate the views with updated structure
        DB::statement('
            CREATE VIEW user_workspace_permissions AS
            SELECT 
                wm.id,
                wm.user_id,
                wm.workspace_id,
                wm.role,
                wm.role_id,
                wm.status,
                wm.permissions,
                tr.name as role_name,
                tr.permissions as role_permissions,
                u.name as user_name,
                u.email as user_email,
                w.name as workspace_name
            FROM workspace_members wm
            LEFT JOIN team_roles tr ON wm.role_id = tr.id
            LEFT JOIN users u ON wm.user_id = u.id
            LEFT JOIN workspaces w ON wm.workspace_id = w.id
        ');
        
        DB::statement('
            CREATE VIEW workspace_invitation_stats AS
            SELECT 
                workspace_id,
                COUNT(*) as total_members,
                COUNT(CASE WHEN status = "active" THEN 1 END) as active_members,
                COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_invites,
                COUNT(CASE WHEN status = "inactive" THEN 1 END) as inactive_members
            FROM workspace_members
            GROUP BY workspace_id
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop views
        DB::statement('DROP VIEW IF EXISTS user_workspace_permissions');
        DB::statement('DROP VIEW IF EXISTS workspace_invitation_stats');
        
        // Remove columns from workspace_members
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['invited_by']);
            $table->dropColumn(['role_id', 'invited_by', 'last_activity_at']);
        });
        
        // Recreate original views
        DB::statement('
            CREATE VIEW user_workspace_permissions AS
            SELECT 
                wm.id,
                wm.user_id,
                wm.workspace_id,
                wm.role,
                wm.status,
                wm.permissions,
                u.name as user_name,
                u.email as user_email,
                w.name as workspace_name
            FROM workspace_members wm
            LEFT JOIN users u ON wm.user_id = u.id
            LEFT JOIN workspaces w ON wm.workspace_id = w.id
        ');
    }
};
