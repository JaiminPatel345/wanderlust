console.log("I will add backend for Filters and for search bar");

const searchButton = document.querySelector(".btn-outline-success");
searchButton.addEventListener('click', (event) => {
  // alert("I will add backend for Filters and for search bar very soon , thank you ")
  Swal.fire({
    icon: "error",
    title: "Sorry",
    text: "I will add backend for Filters and for search bar very soon",
    footer: '<a href="https://jaiminpatel345.github.io/Portfolio/#Feedback">Want to give feedback on this ?</a>'
  });
  event.preventDefault()
  event.stopPropagation()
});

(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

//For tax switch 
const taxSwitch = document.getElementById("flexSwitchCheckDefault");
const taxRate = 0.18; // 18% GST

taxSwitch.addEventListener("click", () => {
  const priceElements = document.querySelectorAll('.card-text span[id^="price-"]');

  for (const priceElement of priceElements) {
    const originalPrice = parseFloat(priceElement.dataset.originalPrice);
    const taxAmount = originalPrice * taxRate;
    const displayedPrice = taxSwitch.checked ? (originalPrice + taxAmount).toLocaleString("en-IN") : originalPrice.toLocaleString("en-IN");

    priceElement.textContent = displayedPrice;

  }
  let taxInfo = document.getElementsByClassName("tax-info");
  for (info of taxInfo) {
    if (info.textContent.includes("Including")) {
      info.textContent = ` (Excluding GST)`;
    } else {
      info.textContent = ` (Including GST)`;
    }
  }
});
