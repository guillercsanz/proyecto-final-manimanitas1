<script>
import { defineProps } from 'vue';
const props = defineProps({
  visible: { type: Boolean, required: true }
});

</script>

<template>
<div class="loading-overlay" >
  <div class="loader-content">
    <img src="@/assets/utunbu.png" class="logo" />
    <div class="barra-carga">
      <div class="texto">Cargando</div>
      <div class="progreso"></div>
    </div>
  </div>
</div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/fondoColonias.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.6s ease;
}

.loading-overlay.hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

@keyframes zoomFade {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: zoomFade 0.8s ease-out;
}

.logo {
  width: 210px;
  height: 210px;
  animation: pulse 1.5s infinite ease-in-out;
  margin-bottom: 30px;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes glow {
  0%   { filter: drop-shadow(0 0 4px #f6911d); }
  50%  { filter: drop-shadow(0 0 12px #ffcc70); }
  100% { filter: drop-shadow(0 0 4px #f6911d); }
}

.barra-carga {
  position: relative;
  width: 240px;
  height: 28px;
  background: #333;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.texto {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  font-size: 0.95rem;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins', sans-serif;
  pointer-events: none;
}

.texto::after {
  content: '...';
  animation: dots 1.2s steps(3, end) infinite;
  margin-left: 2px;
}

@keyframes dots {
  0%   { content: '.'; }
  33%  { content: '..'; }
  66%  { content: '...'; }
  100% { content: '.'; }
}

.progreso {
  position: absolute;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, #f6911d, #ffcc70);
  animation: avanzar 1.8s linear infinite;
  border-radius: 14px;
  z-index: 1;
  box-shadow: 0 0 10px #f6911d, 0 0 20px #ffcc70;
}

@keyframes avanzar {
  0% { left: -40%; }
  100% { left: 100%; }
}
</style>
