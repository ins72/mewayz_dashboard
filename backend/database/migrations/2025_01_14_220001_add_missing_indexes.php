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
        // Add missing indexes only
        $this->addMissingIndexes();
        
        // Create database views for common queries
        $this->createDatabaseViews();
        
        // Update table statistics
        $this->updateTableStatistics();
    }
    
    /**
     * Add missing indexes only
     */
    private function addMissingIndexes(): void
    {
        // Check and add indexes for users table
        if (!$this->indexExists('users', 'idx_users_google_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index(['google_id'], 'idx_users_google_id');
            });
        }
        
        if (!$this->indexExists('users', 'idx_users_email_verified')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index(['email_verified_at'], 'idx_users_email_verified');
            });
        }
        
        // Check and add indexes for workspaces table
        if (!$this->indexExists('workspaces', 'idx_workspaces_owner_created')) {
            Schema::table('workspaces', function (Blueprint $table) {
                $table->index(['owner_id', 'created_at'], 'idx_workspaces_owner_created');
            });
        }
        
        if (!$this->indexExists('workspaces', 'idx_workspaces_name')) {
            Schema::table('workspaces', function (Blueprint $table) {
                $table->index(['name'], 'idx_workspaces_name');
            });
        }
        
        if (!$this->indexExists('workspaces', 'idx_workspaces_status_created')) {
            Schema::table('workspaces', function (Blueprint $table) {
                $table->index(['status'], 'idx_workspaces_status_created');
            });
        }
        
        // Check and add indexes for workspace_members table
        if (!$this->indexExists('workspace_members', 'idx_workspace_user')) {
            Schema::table('workspace_members', function (Blueprint $table) {
                $table->index(['workspace_id', 'user_id'], 'idx_workspace_user');
            });
        }
        
        if (!$this->indexExists('workspace_members', 'idx_user_role')) {
            Schema::table('workspace_members', function (Blueprint $table) {
                $table->index(['user_id', 'role'], 'idx_user_role');
            });
        }
        
        // Check and add indexes for invitation_batches table
        if (!$this->indexExists('invitation_batches', 'idx_batch_workspace_status')) {
            Schema::table('invitation_batches', function (Blueprint $table) {
                $table->index(['workspace_id', 'status'], 'idx_batch_workspace_status');
            });
        }
        
        if (!$this->indexExists('invitation_batches', 'idx_batch_created_by')) {
            Schema::table('invitation_batches', function (Blueprint $table) {
                $table->index(['created_by', 'created_at'], 'idx_batch_created_by');
            });
        }
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop added indexes
        $this->dropIndexSafely('users', 'idx_users_google_id');
        $this->dropIndexSafely('users', 'idx_users_email_verified');
        $this->dropIndexSafely('workspaces', 'idx_workspaces_owner_created');
        $this->dropIndexSafely('workspaces', 'idx_workspaces_name');
        $this->dropIndexSafely('workspaces', 'idx_workspaces_status_created');
        $this->dropIndexSafely('workspace_members', 'idx_workspace_user');
        $this->dropIndexSafely('workspace_members', 'idx_user_role');
        $this->dropIndexSafely('invitation_batches', 'idx_batch_workspace_status');
        $this->dropIndexSafely('invitation_batches', 'idx_batch_created_by');
        
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
    }
    
    /**
     * Drop database views
     */
    private function dropDatabaseViews(): void
    {
        DB::statement("DROP VIEW IF EXISTS workspace_invitation_stats");
        DB::statement("DROP VIEW IF EXISTS user_workspace_permissions");
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
    
    /**
     * Drop index safely
     */
    private function dropIndexSafely(string $table, string $index): void
    {
        if ($this->indexExists($table, $index)) {
            Schema::table($table, function (Blueprint $table) use ($index) {
                $table->dropIndex($index);
            });
        }
    }
};