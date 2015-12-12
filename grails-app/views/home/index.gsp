<!doctype html>
<html>
	<head>
		<meta name="layout" content="semantic"/>
		<title>EPA Digital Services RFI - Search</title>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.7/angular.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.0-rc.0/angular-route.min.js"></script>
		<asset:javascript src="home/index.js" />
	</head>
	<body>
		<div class="ui segment" ng-app="epaApp">
			<div ng-view></div>
		</div>
		<script>
			var contaminantCodes = ${ grailsApplication.parentContext.getResource('data/contaminant_codes.json').file.text };
		</script>
	</body>
</html>
