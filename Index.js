function Index() {

  let watchDog = 10;
  let commands = [];
  let currentCommand = [];
  let clearCommandInterval;
  let morseData = [
    [['T'], ['E']],
    [['M', 'N'], ['A', 'I']],
    [['O', 'G', 'K', 'D'], ['W', 'R', 'U', 'S']],
    [['_', '.', 'Q', 'Z', 'Y', 'C', 'X', 'B'], ['J', 'P', null, 'L', '-', 'F', 'V', 'H']],
    [[0, 9, null, 8, null, null, null, 7, null, null, null, null, null, null, null, 6 ], [1, null, null, null, null, null, null, null, 2, null, null, null, 3, null, 4, 5 ]],
  ];

  let rowStruct = `
    <div class="flex">
      <!--  _______ -->
      <!-- |        -->
      <div style="width: 25%;">
        <div class="flex left"><div class="v"></div><div class="h"></div></div>
        <div style="text-align: left;" class="value">-</div>
      </div>
      <!-- _______  -->
      <!--        | -->
      <div style="width: 25%;">
        <div class="flex right"><div class="h"></div><div class="v"></div></div>
        <div style="text-align: right;" class="value">-</div>
      </div>
    </div>
  `;

  this.init = function() {
    // $('#divMorseTree').empty();
    buildMorseTree(0);
    buildMorseTree(1);

    if( $('#divMorseTreeContainer').width() > $(window).width() ) {
      $('#divMorseTreeContainer').css( 'zoom', ( $(window).width() - 32 ) / $('#divMorseTreeContainer').width() );
    }

    this.observer();
  }

  this.observer = function() {

    // Ação de editar um quadro
    $('#preTextVisualization').on( 'doubleclick', function(e) {
      e.preventDefault();
    });

    $('#preTextVisualization').on( 'pointerdown', function(e) {
      startNewCommand();
    });

    $('body').on( 'keydown', function(e) {

      // Se for backspace, apaga a última sequência de instruções
      if( e.keyCode === 8 ) {
        commands.pop();
        currentCommand = [];
        updateTextsVisualizations();
        $('#preCurrentCommandVisualization').text('');
      }

      if( e.keyCode === 32 ) {
        e.preventDefault();
        startNewCommand();
      }
    });
    
  }

  function startNewCommand() {
    clearTimeout( clearCommandInterval );
    const startTime = ( new Date() ).getTime();

    $('#preTextVisualization').one( 'pointerup', function(e) {
      endNewCommand(); 
    });

    $('body').one( 'keyup', function(e) {
      if( e.keyCode === 32 ) {
        endNewCommand();
      }
    });

    function endNewCommand() {
      const endTime = ( new Date() ).getTime();
      if( ( endTime - startTime ) < 200 ) {
        // É toque simples
        currentCommand.push( '.' );
      } else {
        // É toque contínuo
        currentCommand.push( '-' );
      }

      updateFeedBack( getValue() );

      clearCommandInterval = setTimeout( () => {
        commands.push( currentCommand );
        updateTextsVisualizations();
        currentCommand = [];

        updateFeedBack();
      }, 500 );

    }

  }

  function updateTextsVisualizations() {
    $('#preCommandsVisualization').text( commands.map( command => command.join('') ).join( ' ' ));
    $('#preTextVisualization').text( commands.map( getValue ).join('') );
  }

  function updateFeedBack( value ) {
    
    if( value ) {
      $('#preCurrentCommandVisualization').text( currentCommand.join('') );
      $('.value').removeClass('selected');
      $('.value[value="' + value + '"]').addClass('selected').parent().addClass('track');
    } else {
      $('.value').removeClass('selected').parent().removeClass('track');
      currentCommand = [];
      
    }

  }

  function getValue( commandSequence ) {

    if( !commandSequence ) {
      commandSequence = currentCommand;
    }

    let firstCommand = commandSequence[0];
    let previousCommand = 0;
    let value = '';
    let posibleIndexes = [ 0, 1 ];
    let indexSum = 0;
    let selectedPosition = ( firstCommand == '.' ? 1 : 0 );
    commandSequence.forEach( ( command, index ) => {

      let sidePosition = ( firstCommand ) === '-' ? 0 : 1;
      let rowValues = morseData[index] ? morseData[index][sidePosition] : {};

      indexSum += ( command == '.' ? 1 : 0 ) * index;

      if( previousCommand ) {
        posibleIndexes = [ 2 * selectedPosition, ( 2 * selectedPosition ) + 1 ];
      }

      if( rowValues[ posibleIndexes[ { '-': 0, '.' : 1 }[command] ] ] ) {
        value = rowValues[ posibleIndexes[ { '-': 0, '.' : 1 }[command] ] ];
        selectedPosition = posibleIndexes[ { '-': 0, '.' : 1 }[command] ];
      } else {
        value = rowValues[ index ];
        selectedPosition = index;
      }

      previousCommand = ( command == '.' ? 2 : posibleIndexes[ { '-': 0, '.' : 1 }[command] ] || 1 );

    });

    return value;

  }

  function buildMorseTree( side = 0, depth ) {

    if( !depth ) {
      depth = 0;
    }

    if( ( morseData[depth] || [] )[side] ) {
      let targetContainer = side == 0 ? 'divMorseTreeLeftSide' : 'divMorseTreeRightSide';
      $('#' + targetContainer ).append( `<div class="flex morseRow" style="gap: 2rem">${ rowStruct.repeat( morseData[depth][side].length / 2 ) }</div>` );

      morseData[depth][side].forEach( ( value, index ) => {
        if( value ) {
          $('#' + targetContainer + ' .morseRow').last().find( '.value' ).eq( index ).text( value ).attr( 'value', value );
        } else {
          $('#' + targetContainer + ' .morseRow').last().find( '.value' ).eq( index ).parent().css('opacity', 0);
          // $('#' + targetContainer + ' .morseRow').last().find('.flex').css('opacity', 0);
          // $('#' + targetContainer + ' .morseRow').last().find( '.h' ).eq( index ).css('opacity', 0);
        }
      });

      watchDog--;
      if( watchDog > 0 ) {
        buildMorseTree( side, depth+1 );
      }
      
    }

  }

  
}

( new Index() ).init();