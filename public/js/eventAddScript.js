$(document).ready(function () {
  let prizeCounter = 3
  prizeCounter = prizeCounter + 1
  $(document).on('click', '#addPoints', () => {
    const newHtml = `${$('#wrapdiv').html()}
    <label for="points${prizeCounter}">Points for Winner  ${prizeCounter}: </label>
    <input type="number" id="points${prizeCounter}" name="points${prizeCounter}">`
    $('#wrapdiv').html(newHtml)
    prizeCounter++
  })
  const start = $('#startTime')
  const end = $('#endTime')
  start.on('change', function () {
    if (start.value) { end.min = start.value }
  }, false)
  $(document).on('click', '#submitCreate', () => {
    const points = []
    points.length = prizeCounter
    for (let i = 1; i <= prizeCounter; i++) {
      if (!$(`#points${i}`).val()) {
        points.length = i - 1
        break
      } else { points[i - 1] = $(`#points${i}`).val() }
    }
    const formData = {
      name: $('#eventName').val(),
      cluster: $('#cluster').val(),
      cup: $('#cup').val(),
      points: points,
      places: prizeCounter,
      venue: $('#venue').val(),
      description: $('#description').val(),
      rules: $('#rules').val(),
      date: $('#date').val(),
      startTime: $('#startTime').val(),
      endTime: $('#endTime').val()
    }
    $.ajax({
      url: 'admin/events',
      method: 'post',
      data: formData,
      contentType: 'application/x-www-form-urlencoded',
      success: function (response) {
        swal('Done', 'Event created successfully', 'success').then(() => {
          window.location.href = 'events'
        })
      },
      error: (res) => {
        if (res.status < 500) {
          swal('Validation Error', res.responseText, 'error')
        } else {
          swal('Server Error', res.responseText, 'error')
        }
      }
    })
  })
})
