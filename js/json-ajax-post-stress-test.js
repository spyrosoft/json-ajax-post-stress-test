var days_for_cookies_to_live = 10;

$(document).ready(
	function() {
		set_event_handlers();
		add_json_key_value_input();
		restore_settings_from_previous_session();
	}
);

function set_event_handlers()
{
	$( '#add-json-key-value-input-button' ).click( add_json_key_value_input );
	$( '#generate-json-from-key-value-input-button' ).click( generate_json_from_key_value_input );
	$( '#url-to-post-to' ).blur( store_url_cookie );
	$( '#json-input' ).change( store_url_cookie );
	$( '#json-input' ).blur( store_url_cookie );
	$( '.begin-button' ).click( begin_stress_test );
	$( 'fieldset legend' ).click( toggle_fieldset_content );
}

function add_json_key_value_input()
{
	$( '#json-key-value-input' ).append( $( '#json-key-value-input-template' ).html() );
	$( '#json-key-value-input' ).off( 'click', '.remove-json-key-value-button', remove_json_key_value );
	$( '#json-key-value-input' ).on( 'click', '.remove-json-key-value-button', remove_json_key_value );
}

function remove_json_key_value()
{
	$( this.parentNode.parentNode ).remove();
}

function generate_json_from_key_value_input()
{
	$( '#json-input' ).val( JSON.stringify( build_json_object_from_key_value_input() ) );
}

function build_json_object_from_key_value_input()
{
	var json = new Object;
	var json_key_elements = $( '#json-key-value-input .json-key' );
	var json_value_elements = $( '#json-key-value-input .json-value' );
	
	if ( json_key_elements.length != json_value_elements.length )
	{
		alert( 'Somehow the JSON key value pairs have a different number of elemnets. Try refreshing the page, or removing all of them and starting over.' );
		return;
	}
	
	var json_keys = new Array;
	var json_values = new Array;
	
	json_key_elements.each(
		function() {
			json_keys.push( $( this ).val() );
		}
	);
	json_value_elements.each(
		function() {
			json_values.push( $( this ).val() );
		}
	);
	
	for (
		json_counter = 0;
		json_counter < json_keys.length;
		json_counter++
	) {
		json[ json_keys[ json_counter ] ]
			= get_parsed_javascript_value( json_values[ json_counter ] );
	}
	
	return json;
}

function get_parsed_javascript_value( value_to_parse )
{
	if ( isFinite( value_to_parse ) )
	{
		return eval( value_to_parse );
	}
	
	if ( value_to_parse[ 0 ] == "[" )
	{
		var json_value;
		try
		{
			json_value = eval( value_to_parse );
		}
		catch( error )
		{
			json_value = value_to_parse;
		}
		return json_value;
	}
	
	if ( value_to_parse[ 0 ] == "{" )
	{
		var json_value;
		try
		{
			json_value = JSON.parse( value_to_parse );
		}
		catch( error )
		{
			json_value = value_to_parse;
		}
		return value_to_parse;
	}
	
	if ( !value_to_parse )
	{
		return "";
	}
	
	return value_to_parse;
}

function begin_stress_test()
{
	$( '#report' ).html( "" );
	
	if ( !validate_input_json() )
	{
		alert( "Please input valid JSON." )
		return;
	}
	
	var json_input = JSON.parse( $( '#json-input' ).val() );
	
	var iteration_key_variable_errors = validate_iteration_key_variable( json_input );
	
	if ( iteration_key_variable_errors.length > 0 )
	{
		alert( iteration_key_variable_errors.join( '\n' ) );
		return;
	}
	
	var number_of_stress_test_calls = $( '#number-of-stress-test-calls' ).val();
	
	if ( number_of_stress_test_calls != parseInt( number_of_stress_test_calls ) )
	{
		alert( "The Settings > Number of Stress Test Calls field needs to be an integer." );
		return;
	}
	
	
}

function validate_input_json()
{
	try
	{
		JSON.parse( $( '#json-input' ).val() );
		return true;
	}
	catch( error )
	{
		return false;
	}
}

function validate_iteration_key_variable( json_input )
{
	var errors = new Array;
	
	if (
		$( '#iteration-key-variables' ).val() == ""
		&& $( '#iteration-operator' ).val() == ""
		&& $( '#iteration-step-by' ).val() == ""
	) {
		return errors;
	}
	
	if ( !json_input[ $( '#iteration-key-variables' ).val() ] )
	{
		errors.push( 'No Key Variable exists with the specified Iteration Key Variable name.' );
	}
	
	var available_operators = [ '+', '-', '*', '/', '%' ];
	if ( available_operators.indexOf( $( '#iteration-operator' ).val() ) == -1 )
	{
		errors.push( 'Please choose one of the available operators for the Iteration Key Variable > Operator field: ' + available_operators.join( ' ' ) + '.' );
	}
	
	if ( isNaN( $( '#iteration-step-by' ) ) )
	{
		errors.push( 'Please use a number for the Iteration Key Variable > Step By field' );
	}
	
	return errors;
}

function restore_settings_from_previous_session()
{
	var stored_json_input = read_cookie( 'stored_json_input' );
	if ( stored_json_input )
	{
		$( '#json-input' ).val( stored_json_input );
	}
	
	var stored_url = read_cookie( 'stored_url' );
	if ( stored_url )
	{
		$( '#url-to-post-to' ).val( stored_url );
	}
}

function store_url_cookie()
{
	var url_to_post_to = $( '#url-to-post-to' ).val();
	if ( url_to_post_to == '' )
	{
		return;
	}
	create_cookie( 'stored_url', url_to_post_to, days_for_cookies_to_live );
}


function toggle_fieldset_content()
{
	var fieldset_content = $( this.parentNode ).find( '.fieldset-content' );
	if ( fieldset_content.css( 'display' ) == 'none' )
	{
		fieldset_content.css( 'display', 'block' );
	} else {
		fieldset_content.css( 'display', 'none' );
	}
	
}






// Adapted from http://www.quirksmode.org/js/cookies.html
function create_cookie( cookie_name, cookie_value, cookie_days_to_live )
{
	if ( cookie_days_to_live )
	{
		var cookie_days_to_live_date = new Date();
		cookie_days_to_live_date.setTime(
			cookie_days_to_live_date.getTime()
			+ (
				cookie_days_to_live * 24 * 60 * 60 * 1000
			)
		);
		var cookie_expires_segment = "; expires="
			+ cookie_days_to_live_date.toGMTString();
	}
	else
	{
		var cookie_expires_segment = "";
	}
	document.cookie = cookie_name
		+ "="
		+ cookie_value
		+ cookie_expires_segment
		+ "; path=/";
}

function read_cookie( cookie_name )
{
	var cookie_name_equal_segment = cookie_name + "=";
	var cookie_segments = document.cookie.split(';');
	for (
		var cookie_segment_counter = 0;
		cookie_segment_counter < cookie_segments.length;
		cookie_segment_counter++
	) {
		var current_cookie_segment = cookie_segments[cookie_segment_counter];
		while ( current_cookie_segment.charAt( 0 ) == ' ')
		{
			current_cookie_segment = current_cookie_segment.substring(
				1, current_cookie_segment.length
			);
		}
		if ( current_cookie_segment.indexOf( cookie_name_equal_segment ) == 0 )
		{
			return current_cookie_segment.substring(
				cookie_name_equal_segment.length,
				current_cookie_segment.length
			);
		}
	}
	return null;
}

function erase_cookie( cookie_name )
{
	create_cookie( cookie_name, "", -1 );
}