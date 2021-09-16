

function testAlert(){
   // alert('we are executing this thru script injection');
   // alert($('table').html());

}

var dataGlobal = {};

var processDataAfterDelay=function(){
  
  
    let header = $(document).find('h4').text();

    if(header!=null && header == "Staff Availability Report List"){
      setTimeout(processGantChartData, 100);
    }
    
}

var processGantChartData = function() {
    let colHeader =   $('table th:last-child')[0];
    if (colHeader == null || colHeader == undefined) {
      return;
    }

    let trDatas = $('table tr td:nth-last-child(2)'); // $('table tr td:last-child');
    let htmlArrayYearMonthWithItems = [];

    if (colHeader != undefined) {
      $(colHeader).html('');
    }

    let htmlArrayYearMonth = [];
    let htmlArrayDay = [];

    var iCount = 0;
    let noOfDatesPrinted = 0;
    let noOfRecordsForLastSection = 0;

    //$(data.DataCollection).each(function (index)
    $(trDatas).each(function (index) {
      let contextualItem = $($(this)[0]).find('span').text();

     // if (contextualItem == null || contextualItem == '')
       
      //let dataTemp = JSON.parse(contextualItem.CalendarFreeDays);
      let dataTemp = (contextualItem == null || contextualItem == '')? null: JSON.parse(contextualItem);

      let currentTrData = trDatas[index];
      $(currentTrData).html('');

      let noOfitemsInMonth = 0;
     

      if(dataTemp!=null)
        $(dataTemp).each(function (index1) {
          let contextualItem1 = $(this)[0];

          let spanStyle = contextualItem1.H > 0 ? 'spanHoliday'
            : contextualItem1.L > 0 ? 'spanLeave'
              : contextualItem1.FH < 8 && contextualItem1.FH > 0 ? 'spanUnderUtilized'
                : contextualItem1.FH == 0 ? 'span0' : 'span8';

          let htmlControl = contextualItem1.FH != 8 && contextualItem1.FH > 0 ?
            '<span class="' + spanStyle + '">' + contextualItem1.FH + '</span>' :
            '<span class="' + spanStyle + '"></span>';

          // : contextualItem1.FH == 0 ?  'span0' : 'span8';
          $(currentTrData).append(htmlControl);


          
          //*********** Looping for the first element ************
          if (index == 0) {

            //Adding the number of dates which are printed, incrementing it on every print of 'DATE'
            //We need to calculate only for the FIRST ITERATION/Loop
            noOfDatesPrinted++;


            let day = contextualItem1.D.substring(0, 2);
            let monthYear = contextualItem1.D.substring(3, 11);

            //********** processing for Month ***************
            var existingRecords = $.grep(htmlArrayYearMonth, function (yearMonth) {
              return yearMonth == monthYear;
            });

            noOfitemsInMonth++;

            if (existingRecords.length == 0) {

              //Update the Previous Item with 'noOfitemsInMonth'

              if (htmlArrayYearMonthWithItems.length > 0) {
                var previousItem = htmlArrayYearMonthWithItems[iCount - 1];
                //previousItem.NoOfItems = noOfitemsInMonth - previousItem.NoOfItems;
                previousItem.NoOfItems = noOfitemsInMonth;
              }

              htmlArrayYearMonth.push(monthYear);
              htmlArrayYearMonthWithItems.push({
                MonthYear: monthYear,
                NoOfItems: noOfitemsInMonth
              });


              noOfRecordsForLastSection = noOfitemsInMonth;
              noOfitemsInMonth = 0;
              iCount++;
            }


            //*********** processing for Day Header ****************
            spanStyle = (iCount % 2) == 0 ? 'spanEven' : 'spanOdd';
            let htmlControl = '<span class="' + spanStyle + '">' + day + '</span>'
            $(colHeader).append(htmlControl);

            //htmlArrayDay.push(day);
          }
        });
    });

    //Find the first span in the col header and then add -3px as margin
    let spanFirst = $(colHeader).find('span').length >0 ? $(colHeader).find('span')[0] : null;
    if( spanFirst!=null)
    {
        $(spanFirst).addClass('marginNeg3px');
    }


    if (htmlArrayYearMonthWithItems.length > 0) {
      let totalItemsBeforeLastItem = 0;
      iCount = 0;
      $(htmlArrayYearMonthWithItems).each(function (index) {
        if (iCount < htmlArrayYearMonthWithItems.length - 1) {
          totalItemsBeforeLastItem += htmlArrayYearMonthWithItems[index].NoOfItems;
        }
        iCount++;
      });


      var lastItem = htmlArrayYearMonthWithItems[htmlArrayYearMonthWithItems.length - 1];
      lastItem.NoOfItems = noOfDatesPrinted - totalItemsBeforeLastItem; // - lastItem.NoOfItems;
    }


    //****** 13 is the width , total pixel needs to be adjusted with number of months which are to be print on top (each taking 100 pixel)
    let totalPixelPrinted = noOfDatesPrinted * 13;
    let pixelPerMonth = Math.round(totalPixelPrinted / $(htmlArrayYearMonth).length);
    // let actualPixelPerMonth =

    let divHeader = '<div>';
    iCount = 0;
    let previousStyle = 'spanOdd';

    //
    $(htmlArrayYearMonthWithItems).each(function (index) {
      let itemTemp = htmlArrayYearMonthWithItems[index];

      let totalPixelPrinted_ThisMonth = itemTemp.NoOfItems * 13;
      let htmlSpanHeader = '<span style="width:' + totalPixelPrinted_ThisMonth + 'px' + ((iCount==0)?';margin-left:-3px;':'') + '" class="' + previousStyle + '">' + itemTemp.MonthYear + '</span>'
      previousStyle = previousStyle == 'spanEven' ? 'spanOdd' : 'spanEven';

      divHeader += htmlSpanHeader;
      iCount++;

    });

    //Setting the Headers
    //$(htmlArrayYearMonth).each(function (index) {
    //    //If iCount is divisible by 2 then 'Even' Else 'Odd'

    //    let htmlSpanHeader = '<span style="width:' + pixelPerMonth + '" class="' + previousStyle + '">' + htmlArrayYearMonth[index] + '</span>'
    //    previousStyle = previousStyle == 'spanEven' ? 'spanOdd' : 'spanEven';

    //    divHeader += htmlSpanHeader;
    //    iCount++;

    //});

    divHeader += '</div>';

    $(colHeader).prepend('</br>');
    $(colHeader).prepend(divHeader);
    
    //$(colHeader).append(divHeader);

  }