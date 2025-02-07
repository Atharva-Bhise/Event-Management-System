
  function updatePrice(value) {
    document.getElementById('price-value').textContent = `$${value}`;
  }
  
  document.getElementById('otherServiceCheck').addEventListener('change', function() {
    document.getElementById('otherService').classList.toggle('hidden', !this.checked);
  });
  
  document.getElementById('otherEventCheck').addEventListener('change', function() {
    document.getElementById('otherEvent').classList.toggle('hidden', !this.checked);
  });
