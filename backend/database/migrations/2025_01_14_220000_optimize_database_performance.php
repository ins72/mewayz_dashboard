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
        // Add performance indexes for workspace_invitations
        Schema::table('workspace_invitations', function (Blueprint $table) {
            // Composite index for most common query patterns
            $table->index(['workspace_id', 'status', 'created_at'], 'idx_workspace_status_created');
            
            // Index for email lookups
            $table->index(['email', 'status'], 'idx_email_status');
            
            // Index for token lookups (already exists but ensure it's optimized)
            $table->index(['token', 'status', 'expires_at'], 'idx_token_status_expires');
            
            // Index for invited_by user
            $table->index(['invited_by', 'created_at'], 'idx_invited_by_created');
            
            // Index for role-based queries
            $table->index(['role', 'workspace_id'], 'idx_role_workspace');
        });
        
        // Add performance indexes for users
        Schema::table('users', function (Blueprint $table) {
            // Index for email lookups (if not already exists)
            if (!$this->indexExists('users', 'users_email_index')) {
                $table->index(['email'], 'idx_users_email');
            }
            
            // Index for Google OAuth
            $table->index(['google_id'], 'idx_users_google_id');
            
            // Index for email verification
            $table->index(['email_verified_at'], 'idx_users_email_verified');
            
            // Index for active users
            $table->index(['created_at', 'email_verified_at'], 'idx_users_created_verified');
        });
        
        // Add performance indexes for workspaces
        Schema::table('workspaces', function (Blueprint $table) {
            // Index for user's workspaces
            $table->index(['owner_id', 'created_at'], 'idx_workspaces_owner_created');
            
            // Index for workspace search
            $table->index(['name'], 'idx_workspaces_name');
            
            // Index for active workspaces
            $table->index(['status', 'created_at'], 'idx_workspaces_status_created');
        });
        
        // Add performance indexes for workspace_members
        Schema::table('workspace_members', function (Blueprint $table) {
            // Composite index for member lookups
            $table->index(['workspace_id', 'user_id'], 'idx_workspace_user');
            
            // Index for user's workspaces
            $table->index(['user_id', 'role'], 'idx_user_role');
            
            // Index for workspace team
            $table->index(['workspace_id', 'role', 'joined_at'], 'idx_workspace_role_joined');
        });
        
        // Add performance indexes for invitation_batches
        Schema::table('invitation_batches', function (Blueprint $table) {
            // Index for workspace batch lookups
            $table->index(['workspace_id', 'status'], 'idx_batch_workspace_status');
            
            // Index for user's batches
            $table->index(['created_by', 'created_at'], 'idx_batch_created_by');
        });
        
        // Create database views for common queries
        $this->createDatabaseViews();
        
        // Update table statistics
        $this->updateTableStatistics();
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop custom indexes
        Schema::table('workspace_invitations', function (Blueprint $table) {
            $table->dropIndex('idx_workspace_status_created');
            $table->dropIndex('idx_email_status');
            $table->dropIndex('idx_token_status_expires');
            $table->dropIndex('idx_invited_by_created');
            $table->dropIndex('idx_role_workspace');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_google_id');
            $table->dropIndex('idx_users_email_verified');
            $table->dropIndex('idx_users_created_verified');
        });
        
        Schema::table('workspaces', function (Blueprint $table) {
            $table->dropIndex('idx_workspaces_owner_created');
            $table->dropIndex('idx_workspaces_name');
            $table->dropIndex('idx_workspaces_status_created');
        });
        
        Schema::table('workspace_members', function (Blueprint $table) {
            $table->dropIndex('idx_workspace_user');
            $table->dropIndex('idx_user_role');
            $table->dropIndex('idx_workspace_role_joined');
        });
        
        Schema::table('invitation_batches', function (Blueprint $table) {
            $table->dropIndex('idx_batch_workspace_status');
            $table->dropIndex('idx_batch_created_by');
        });
        
        // Drop database views
        $this->dropDatabaseViews();
    }
    
    /**
     * Create database views for common queries
     */
    private function createDatabaseViews(): void
    {
        // Drop views first if they exist (SQLite compatible)
        DB::statement("DROP VIEW IF EXISTS workspace_invitation_stats");
        DB::statement("DROP VIEW IF EXISTS user_workspace_permissions");
        DB::statement("DROP VIEW IF EXISTS invitation_analytics");
        
        // View for workspace invitation statistics
        DB::statement("
            CREATE VIEW workspace_invitation_stats AS
            SELECT 
                workspace_id,
                COUNT(*) as total_invitations,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invitations,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_invitations,
                COUNT(CASE WHEN status = 'declined' THEN 1 END) as declined_invitations,
                COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_invitations,
                ROUND(
                    COUNT(CASE WHEN status = 'accepted' THEN 1 END) * 100.0 / COUNT(*), 2
                ) as acceptance_rate,
                MIN(created_at) as first_invitation_at,
                MAX(created_at) as last_invitation_at
            FROM workspace_invitations
            GROUP BY workspace_id
        ");
        
        // View for user workspace permissions
        DB::statement("
            CREATE VIEW user_workspace_permissions AS
            SELECT 
                wm.user_id,
                wm.workspace_id,
                wm.role,
                w.name as workspace_name,
                u.name as user_name,
                u.email as user_email,
                wm.joined_at,
                CASE 
                    WHEN wm.role = 'owner' THEN 1
                    WHEN wm.role = 'admin' THEN 2
                    WHEN wm.role = 'editor' THEN 3
                    WHEN wm.role = 'contributor' THEN 4
                    WHEN wm.role = 'viewer' THEN 5
                    ELSE 6
                END as role_priority
            FROM workspace_members wm
            JOIN workspaces w ON wm.workspace_id = w.id
            JOIN users u ON wm.user_id = u.id
        ");
        
        // View for invitation analytics (simplified for SQLite)
        DB::statement("
            CREATE VIEW invitation_analytics AS
            SELECT 
                wi.workspace_id,
                wi.role,
                COUNT(*) as invitation_count,
                COUNT(CASE WHEN wi.status = 'accepted' THEN 1 END) as accepted_count,
                date(wi.created_at) as invitation_date
            FROM workspace_invitations wi
            GROUP BY wi.workspace_id, wi.role, date(wi.created_at)
        ");
    }
    
    /**
     * Drop database views
     */
    private function dropDatabaseViews(): void
    {
        DB::statement("DROP VIEW IF EXISTS workspace_invitation_stats");
        DB::statement("DROP VIEW IF EXISTS user_workspace_permissions");
        DB::statement("DROP VIEW IF EXISTS invitation_analytics");
    }
    
    /**
     * Update table statistics for query optimization
     */
    private function updateTableStatistics(): void
    {
        $tables = [
            'workspace_invitations',
            'users',
            'workspaces',
            'workspace_members',
            'invitation_batches'
        ];
        
        foreach ($tables as $table) {
            try {
                // SQLite uses ANALYZE instead of ANALYZE TABLE
                DB::statement("ANALYZE {$table}");
            } catch (\Exception $e) {
                // Handle databases that don't support ANALYZE
                \Log::info("Could not analyze table {$table}: " . $e->getMessage());
            }
        }
    }
    
    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        try {
            // SQLite uses PRAGMA index_list instead of SHOW INDEX
            $indexes = DB::select("PRAGMA index_list({$table})");
            return collect($indexes)->contains('name', $index);
        } catch (\Exception $e) {
            return false;
        }
    }
};