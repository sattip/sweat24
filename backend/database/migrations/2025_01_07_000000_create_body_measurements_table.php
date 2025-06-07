<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('body_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('weight')->nullable();
            $table->string('height')->nullable();
            $table->string('waist')->nullable();
            $table->string('hips')->nullable();
            $table->string('chest')->nullable();
            $table->string('arm')->nullable();
            $table->string('thigh')->nullable();
            $table->string('body_fat')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('body_measurements');
    }
};
