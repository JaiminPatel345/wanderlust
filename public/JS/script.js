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

