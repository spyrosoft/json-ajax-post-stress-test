$(document).ready(
	function() {
		$( '#add-json-key-value-input-button' ).click( add_json_key_value_input );
		$( '#generate-json-from-key-value-input-button' ).click( generate_json_from_key_value_input )
		add_json_key_value_input();
	}
);

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
	$( '#json-to-post' ).val( JSON.stringify( build_json_object_from_key_value_input() ) );
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
		try {
			json_value = eval( value_to_parse );
		} catch( error ) {
			json_value = value_to_parse;
		}
		return json_value;
	}
	
	if ( value_to_parse[ 0 ] == "{" )
	{
		var json_value;
		try {
			json_value = JSON.parse( value_to_parse );
		} catch( error ) {
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