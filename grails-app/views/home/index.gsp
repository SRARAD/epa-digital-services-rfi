<!doctype html>
<html>
	<head>
		<meta name="layout" content="semantic"/>
		<title>EPA Digital Services RFI - Search</title>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.7/angular.js"></script>
		<asset:javascript src="home/index.js" />
	</head>
	<body>
		<div class="ui segment" ng-app="epaApp" ng-controller="EPACtrl">
			<div class="ui middle aligned centered grid">
				<div class="row">
					<div class="sixteen wide">
						<h1 class="ui center aligned icon header">
							<i class="circular leaf icon"></i>
							EPA Envirofacts Search
							<div class="sub header">Enter a zipcode or address</div>
						</h1>
						<div class="ui icon huge input">
							<input type="text" placeholder="Search...">
							<i class="inverted circular search link icon"></i>
						</div>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
