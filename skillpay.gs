  const main_name = 'MainList'
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const ui = SpreadsheetApp.getUi()
  const skillpay_url = 'http://194.58.92.160:8000'

  function onOpen(){
    ui.createMenu('Меню запросов')
    .addItem('Отпрвить данные на сервер','main')
    .addToUi();
  }

  function main(){
    var main = ss.getSheetByName(main_name)
    let data = colect_data(main)
    if (!data[0]){
      ui.alert('Нет данных для отправки.')
      throw('empty data error')
    }
    let counter = data[1]
    status = send_request(data[0])
    if (status == 200){
      ui.alert('Данные успешно загружены на сервер!')
      clear_data(main, counter)
    }
    else{
      ui.alert('Ошибка! Не удалось загрузить данные на сервер! Статус запроса:' + status)
    }

  }

  // function init_main_table() {
  //   var main = ss.getSheetByName(main_name)
  //   if (!main){
  //     main = ss.insertSheet(main_name)
  //     main.setName(main_name)
  //     main.appendRow(['Реквезиты','Сумма','Название банка'])
  //     main.appendRow([123123124, 1000, 'Тинькофф'])
  //     main.appendRow([123213412, 15000, 'Cбербанк'])
  //     main.getRange('A1:C1').setBackground('#4a86e8')
  //   }

  // }

  function do_iteration(main, counter){
    let range = main.getRange('A'+ counter + ':C'+ counter)
    values = range.getDisplayValues()
    console.log(values[0])
    return values[0]
  }

  function format_values(values){
    if (values[0] && values[1] && values[2]){
      try{
        return {
          'paymethod':values[2],
          'card_number': values[0],
          'amount': parseInt(values[1]),
          }
      }
      catch(e){
        ui.alert('Ошибка! Не правильный формат суммы')
      }
    }
    else{
      ui.alert('Ошибка! Данные в столбцах были заполнены не правильно.')
      throw('ERROR: columns must not contain spaces.')
    }
  }

  function colect_data(){
    const main = ss.getSheetByName(main_name)
    data = []
    let counter= 2
    let i 
    let flag = true
    while (flag){
      i = do_iteration(main, counter)
      if (i[0] || i[1] || i[2]){
        counter += 1
        data.push(format_values(i))
      }
      else {
        flag = false
      }
    }
    return [data, counter]
  }


function send_request(data){
  let options = {
  'method': 'post',
  'payload': JSON.stringify(data),
  }
  console.log(options)
    try{
      let response = UrlFetchApp.fetch(skillpay_url + '/api/create/pays/', options);
      return(response.getResponseCode())
    }
    catch(e){
      console.log(typeof(e))
      ui.alert('Ошибка! Данные не передались на сервер.\n' + e)
      throw(e)
   }
}

function clear_data(main, counter){
  let range = main.getRange('A2' + ':C'+ counter)
  console.log(counter)
  range.clear()
}












