/**
 * .reel Unit Test
 */
( function run(){
  
  var
    test_subjects_snapshot,
    default_jquery = '1.10.2'

  yepnope( {
    load: [
      'http://code.jquery.com/jquery-'+(location.params.jq || default_jquery)+'.min.js',
      'lib/vendor/jquery.xdomainrequest.js',
      '../jquery.reel.js',
      'lib/vendor/jquery.mousewheel-min.js',

      'lib/vendor/qunit.js',
      'lib/vendor/jquery.cookie-min.js',
      'lib/quny.js',

      'unit/sprite.js',
      'unit/selector.js',
      'unit/rendering.js',
      'unit/options.js',
      'unit/issues.js',
      'unit/interaction.js',
      'unit/events.js',
      'unit/data.js',
      'unit/computation.js',
      'unit/api.js',
      'unit/annotations.js',
      'unit/animation.js'
    ],
    complete: function(){

      var
        dawn= +new Date(),
        bads= 0,
        counts= 0

      location.params.respawn && setTimeout(function(){
        location.href= location.href;
      }, location.params.respawn * 1000);

      test_subjects_snapshot= $('#Body').html();

      QUnit.load();
      QUnit.stop();

      QUnit.testDone = function(testName, bad, count) {
        bad && (bads+= bad);
        counts+= count;
        $('#qunit-banner .pass').text(counts - bads);
        $('#qunit-banner .fail').text(bads || '');
      }

      QUnit.done = function(failures, total, config) {
        $('body').addClass('done');
        if (failures){
          location.params.respawn && $('#qunit-filter-pass').click();
          $('body').addClass('failure');
          $('#call h2 .number').text(failures);
          failures <= 1 && $('#failure h2 .plural').hide();
        }else{
          $('body').addClass('success');
        }
        $('#qunit-testrunner-toolbar').show();

        /*
         * Results of the just finished testrun are automatically submitted
         * and collected on the Reel webserver as a kind of distributed
         * testing effort. Thanks for being a part of it!
         *
         * Data collected:
         * - timestamp
         * - counts (total number of tests, fails and passes)
         * - failures themselves
         * - versions (version of jQuery and Reel)
         * - the results summary line with duration
         * - user agent string (your browser name and its version(s))
         * - test host domain
         */
        var
          //server= 'http://au:4567',
          server= 'http://reel360.org',
          timestamp= +new Date(),
          report= {
            timestamp:  timestamp,
            duration:   qunit_completed_in,
            host:       location.host,
            filter:     config.filters,
            count: {
              total:    total,
              pass:     total - failures,
              fail:     failures
            },
            fails:      dump($('#qunit-tests li.fail')),
            version: {
              jquery:   $().jquery,
              reel:     $.reel.version
            },
            results:    $('#qunit-testresult').html(),
            agent:      $('#qunit-userAgent').html()
          }

        $('<a/>', { name: 'receipt' }).appendTo('#qunit-testresult');
        formatted(report, 'Summary').appendTo( $('<ul/>').appendTo('#receipt') );

        $.ajax({
          url: server+'/collect/reel/testrun/results',
          method: 'POST',
          dataType: 'json',
          cache: false,
          data: report
        });

        function formatted( bit, label ){
          var $result= $('<li/>')
          if( typeof bit == 'object' ){
            if( typeof bit.length != 'number' || bit.length > 0 ){ // Object/Array
              $result.text( label+':' );
              var $list= $('<ul/>').appendTo( $result )
              $.each( bit, function( label, value ){
                $list.append( formatted(value, label) );
              } );
            }
          }else{ // Value
            $result.html( label+': '+bit );
          }
          return $result
        }

        function dump($collection){
          var collection = [];
          $collection.each(function(){
            collection.push($(this).html())
          })
          return collection;
        }
      }

      $('#against-jquery-versions')
      .val( location.params.jq || default_jquery )
      .change( function(){
        var url= ''
        if( location.params.jq === undefined ){
          if( location.search === '' ){
            url= location.href.replace( /\?$/, '' ) + '?jq='+$(this).val()
          }else{
            url= location.href + '&jq=' + $(this).val()
          }
        }else{
          url= location.href.replace( 'jq=' + location.params.jq, 'jq=' + $(this).val() );
        }
        location.href= url;
      } )

      var oldstart= window.start;
      window.start= function(){
        $(document).unbind('.test');
        oldstart();
      }

    }
  } );

  reel_test_module_routine= {
    setup: function(){
      $.reel.intense= true;
    },
    teardown: function(){
      $('#Body *').add(document).unbind('.test');
      $.reel.instances.unreel();
      $('#my_data_configured_image').remove();
      $('#Body .no_id').removeAttr('id');

      // Verify the integrity of test samples
      QUnit.stop();
      if ($('#Body').html() === test_subjects_snapshot){
        QUnit.start();
      }else{
        console.error('Test subjects intergrity has been compromised:');
        console.info( $('#Body').html() );
        console.warn('... should have read:');
        console.info( test_subjects_snapshot );
        console.error('Can not continue...');
      }
    }
  }

} )();
