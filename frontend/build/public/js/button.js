function f () {
  var res = {}
  res.type = $('#check1').val()
  res.crit = $('#check2').val()

  if ($('#7a_7b')[0].style.display != 'none') {
    res.level = $('#level_1').val()
    res.winner = $('#winner_1').val()
    res.team = $('#team_1').val()
    res.dspo = $('#dspo_1').val()
    res.o4no = $('#o4no_1').val()
  }

  if ($('#8a')[0].style.display != 'none') {
    res.reward = $('#reward_1').val()
    if ($('#a8_first_second_crit')[0].style.display != 'none') {
      res.winner = $('#winner_2').val()
      res.team = $('#team_2').val()
      res.dspo = $('#dspo_2_1').val()
    }
    if ($('#a8_2_crit')[0].style.display != 'none') {
      res.indiv = $('#indiv_2').val()
      res.dspo = $('#dspo_2_2').val()
    }
    if ($('#a8_4_crit')[0].style.display != 'none') {
      res.dspo = $('#dspo_2_3').val()
    }
  }

  if ($('.show_hide_8b')[0].style.display != 'none') {
    res.izd = $('#izd').val()
    if ($('.b8')[0].style.display != 'none') {
      res.index = $('#index').val()
    }
    if ($('.b8_1')[0].style.display != 'none') {
      res.index_type = $('#index_type').val()
    }
    if ($('#8_2_1')[0].style.display != 'none') {
      res.sdnsk = $('#sdnsk').val()
    }
    if ($('#8_2_2')[0].style.display != 'none') {
      res.ud = $('#ud').val()
    }
  }

  if ($('.show_hide_a9')[0].style.display != 'none') {
    res.organise = $('#organise').val()
    if ($('.select_9a_1_8')[0].style.display != 'none') {
      res.level = $('#level_a9_1').val()
      res.cycle = $('#cycle_a9_1').val()
      res.lead = $('#lead_a9_1').val()
    }
    if ($('.select_9a_9')[0].style.display != 'none') {
      res.o4no = $('#o4no_a9_1').val()
    }
    if ($('.select_9a_10')[0].style.display != 'none') {
      res.dspo = $('#dspo_a9_1').val()
      res.student = $('#student_a9_1').val()
    }
    if ($('.select_9a_11_12')[0].style.display != 'none') {
      res.lead = $('#lead_a9_2').val()
    }
  }

  if ($('.show_hide_b9')[0].style.display != 'none') {
    res.tv = $('#tv_b9_1').val()
    if ($('.select_9b_1')[0].style.display != 'none') {
      res.role = $('#role_9b_1').val()
    }
    if ($('.select_9b_2')[0].style.display != 'none') {
      res.role = $('#role_9b_2').val()
    }
    if ($('.select_9b_3')[0].style.display != 'none') {
      res.role = $('#role_9b_3').val()
    }
    if ($('.select_9b_4')[0].style.display != 'none') {
      res.role = $('#role_9b_4').val()
    }
  }

  if ($('.show_hide_a10')[0].style.display != 'none') {
    res.level = $('#level_a10_1').val()
    res.winner = $('#winner_a10_1').val()
    res.team = $('#team_a10_1').val()
  }

  if ($('.show_hide_b10')[0].style.display != 'none') {
    res.level = $('#level_b10_1').val()
    res.team = $('#team_b10_1').val()
  }

  if ($('.show_hide_c10')[0].style.display != 'none') {
    res.level = $('#level_c10_1').val()
    res.cycle = $('#cycle_c10_1').val()
    res.role = $('#role_c10_1').val()
  }

  if ($('.show_hide_a11')[0].style.display != 'none') {
    res.level = $('#level_a11_1').val()
    res.o4no = $('#o4no_a11_1').val()
    res.team = $('#team_a11_1').val()
    res.winner = $('#winner_a11_1').val()
  }

  if ($('.show_hide_b11')[0].style.display != 'none') {
    res.part = $('#level_b11_1').val()
    res.o4no = $('#o4no_b11_1').val()
    if ($('.select_b11_1')[0].style.display != 'none') {
      res.winner = $('#winner_b11_1').val()
      res.team = $('#team_b11_1').val()
    }
    if ($('.select_b11_2')[0].style.display != 'none') {
      res.role = $('#role_b11_1').val()
    }
    if ($('.select_b11_3')[0].style.display != 'none') {
      res.level = $('#level_b11_2').val()
    }
  }
  res.comment = $('#comment').val()
  res.status = 'Ожидает проверки'
  res.ball = 0
  var form = document.forms.namedItem('fileinfo')
  console.log(form)
  var oData = new FormData(form)
  oData.append('data', JSON.stringify(res))
  var oReq = new XMLHttpRequest()
  oReq.open('POST', '/add_achieve', true)
  oReq.onload = function (oEvent) {
    if (oReq.status === 200) {
      console.log('Uploaded!')
      $('#myModal').on('shown.bs.modal', function () {
        $('#myInput').trigger('focus')
      })
    }
    else {
      console.log(
        'Error ' + oReq.status + ' occurred when trying to upload your file.'
      )
    }
  }
  oReq.send(oData)
  console.log(res)
}
