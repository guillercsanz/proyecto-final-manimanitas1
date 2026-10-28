
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Contact -->
      <div class="footer-contact">
        <p>{{ t('contact') }}</p>
        <a href="mailto:contacto.utunbu@gmail.com" class="contact-link">
          contacto.utunbu@gmail.com
        </a>
      </div>

      <!-- Copyright -->
      <div class="footer-copyright">
        <p>{{ t('copyright') }}</p>
      </div>

      <!-- Social Media -->
      <div class="footer-social">
        <a href="https://www.instagram.com" target="_blank" class="social-link">
          <font-awesome-icon :icon="['fab', 'instagram']" />
        </a>
        <a href="https://twitter.com" target="_blank" class="social-link">
          <font-awesome-icon :icon="['fab', 'x-twitter']" />
        </a>
        <a href="https://www.facebook.com" target="_blank" class="social-link">
          <font-awesome-icon :icon="['fab', 'facebook']" />
        </a>
      </div>
    </div>
  </footer>
</template>
  
<style scoped>
  .footer {
    width: 100vw;
    background-color: black;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 15px 0;
    box-sizing: border-box;
  }
  
  .footer-content {
    width: 90%;
    max-width: 1400px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  /* Contacto alineado a la izquierda */
  .footer-contact {
    text-align: left;
    font-size: 14px;
  }
  
  /* Link de contacto */
  .footer-contact .contact-link {
    color: #ffcc00;
    text-decoration: none;
  }
  
  .footer-contact .contact-link:hover {
    text-decoration: underline;
  }
  
  /* Copyright alineado en el centro */
  .footer-copyright {
    text-align: center;
    font-size: 14px;
    flex-grow: 1;
  }
  
  /* Redes sociales alineadas a la derecha */
  .footer-social {
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: center;
  }
  
  /* Íconos de redes sociales */
  .social-link {
    color: white;
    font-size: 24px;
    transition: transform 0.2s;
  }
  
  .social-link:hover {
    transform: scale(1.2);
    color: #ffcc00;
  }
</style>