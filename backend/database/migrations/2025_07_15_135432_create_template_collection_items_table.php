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
        Schema::create('template_collection_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('template_collection_id');
            $table->uuid('template_id');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('template_collection_id')->references('id')->on('template_collections')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('templates')->onDelete('cascade');
            
            $table->unique(['template_collection_id', 'template_id']);
            $table->index(['template_collection_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('template_collection_items');
    }
};