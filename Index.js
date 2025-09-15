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
      <div class="left" style="width: 25%;">
        <div class="flex left"><div class="v"></div><div class="h"></div></div>
        <div style="text-align: left;" class="value">-</div>
      </div>
      <!-- _______  -->
      <!--        | -->
      <div class="right" style="width: 25%;">
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

    $('#preTextVisualization').on( 'doubleclick', function(e) {
      e.preventDefault();
    });

    $('#preTextVisualization').on( 'pointerdown', function(e) {
      startNewCommand();
    });

    $('#preTextInsert').on( 'input', function(e) {
      e.preventDefault();
      revertConversion( $(this).val() );
    });

    $('#btnUndoLastCommand').on( 'click', function(e) {
      removeLastCommand();
    });

    $('body').one( 'keydown', handleKeyDown );
    
  }

  function handleKeyDown(e) {

    if( e.keyCode === 32 && !$( e.target ).is( '#preTextInsert' ) ) {
      e.preventDefault();
      startNewCommand();
    } else {
      // Se for backspace, apaga a última sequência de instruções
      if( e.keyCode === 8 ) {
        removeLastCommand();
      }

      $('body').one( 'keydown', handleKeyDown );
      
    }
  }
  function removeLastCommand() {
    commands.pop();
    currentCommand = [];
    updateTextsVisualizations();
    $('#preCurrentCommandVisualization').text('');

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
    
    endNewCommand = function() {
      $('body').one( 'keydown', handleKeyDown );

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

        if( currentCommand.length ) {
          commands.push( currentCommand );
        }
        updateTextsVisualizations();
        currentCommand = [];

        updateFeedBack();
      }, 500 );

    }

  }

  function revertConversion( textToConvert = '' ) {

    let chars = textToConvert.trim().split('').map( i => i.toUpperCase() );
    let allConvertedCommands = [];
    chars.forEach( char => {
      let wd = 10;
      let currentChar = char;
      let convertedCommands = [];

      if( char === ' ' ) {
        convertedCommands.push(' ');
      }
      while( wd > 0 && $( '.value[value="' + currentChar + '"]' ).length ) {

        let direction = $( '.value[value="' + currentChar + '"]' ).parent().attr( 'class' );

        if( direction ) {
          
          let previousValueElement = $( '.value[' + ( direction.includes('right') ? 'right-value' : 'left-value' ) + '="' + currentChar + '"]' );
          
          convertedCommands.push( direction.includes('right') ? '.' : '-' );
          if( previousValueElement.length ) {
            currentChar = $( '.value[' + ( direction.includes('right') ? 'right-value' : 'left-value' ) + '="' + currentChar + '"]' ).attr('value');
          } else {
            let containerSideId = $( '.value[value="' + currentChar + '"]' ).closest('.morseRow').parent().attr('id');
            if( containerSideId ) {
              convertedCommands.push( ( containerSideId || '' ) === 'divMorseTreeRightSide' ? '.' : '-' );
            }
            break;
          }
          
        }

        wd--;

      }

      allConvertedCommands.push( convertedCommands.reverse() );
      
    });

    commands = allConvertedCommands;
    currentCommand = commands.at(-1);

    updateFeedBack();
    updateFeedBack( chars.pop() );
    updateTextsVisualizations();
    
  }

  function updateTextsVisualizations() {
    $('#preCommandsVisualization').text( commands.map( command => command.join('') !== ' ' ? command.join('') : ' ' ).join( '  ' ));
    $('#preTextVisualization').text( commands.map( value => value.join('') !== ' ' ? getValue( value ) : ' ' ).join('') );
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

    if( ( ( morseData[depth] || [] )[side] || [] ).length ) {
      let targetContainer = side == 0 ? 'divMorseTreeLeftSide' : 'divMorseTreeRightSide';
      $('#' + targetContainer ).append( `<div class="flex morseRow" style="gap: 2rem">${ rowStruct.repeat( morseData[depth][side].length / 2 ) }</div>` );

      morseData[depth][side].forEach( ( value, index ) => {
        if( value ) {
          // Marca quais valores são à direita ou à esquerda, para fazer o mapeamento da conversão inversa
          $('#' + targetContainer + ' .morseRow').last().prev().find('.value').eq( Math.floor( index / 2 ) ).attr( index % 2 ? 'right-value' : 'left-value', value );
          $('#' + targetContainer + ' .morseRow').last().find( '.value' ).eq( index ).text( value ).attr( 'value', value );
        } else {
          $('#' + targetContainer + ' .morseRow').last().find( '.value' ).eq( index ).parent().css('opacity', 0);
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