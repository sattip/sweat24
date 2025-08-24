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
        Schema::create('body_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('measurement_date');
            $table->decimal('weight', 5, 2)->nullable(); // kg
            $table->decimal('height', 5, 2)->nullable(); // cm
            $table->decimal('waist', 5, 2)->nullable(); // cm
            $table->decimal('hips', 5, 2)->nullable(); // cm
            $table->decimal('chest', 5, 2)->nullable(); // cm
            $table->decimal('arm', 5, 2)->nullable(); // cm
            $table->decimal('thigh', 5, 2)->nullable(); // cm
            $table->decimal('body_fat_percentage', 5, 2)->nullable(); // %
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'measurement_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('body_measurements');
    }
};