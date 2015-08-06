require 'rubygems'
require 'rack'
require 'json'
require 'active_support'
require 'Users.rb'

ServerPort=3010

class XHRTestSuiteLogger

	@@users = Users.new

	def call env

		# create a new rack request
		req = Rack::Request.new env

		path = req.path.gsub "/", "_"

		send( path, req, env )

	end

	def _user req, env
		# Request method
		method = req.request_method.downcase

		send( method, req )
	end

	def _finish req, env
		userList = JSON.generate @@users.list

		respond userList, req, env
	end

	def method_missing symbol, args
		[404, { 'Content-Type'=>'text/plain' }, "We have no way of handling the #{symbol} request"]
	end

	def get req, env
		# get the user id
		query = req.GET()

		if( query[ "id" ] )
			# retrieve the user from Users
			user = @@users.get query[ "id" ]
		else
			user = "no id was provided"
		end

		# send the user to respond
		respond user, req, env
	end

	def post req, env
		# Setup the user hash
		user = req.POST()

		# Add the new user to Users
		response = @@users.add user

		# Pass the new user to respond
		respond response, req, env

	end

	def put req, env
		# Setup the user hash
		user = req.POST()

		# Update the user in Users
		response = @@users.update user, user.id

		# Pass the updated user to respond
		respond response, req, env

	end

	def delete req, env
		# get the id of the user to delete
		query = req.GET()

		if( query[ "id" ] )
			# remove the user from Users
			removed = @@users.remove query[ "id" ]
		else
			removed = "No id provided"
		end

		# send the response to respond
		respond removed, req, env
	end

	def respond response, req, env

		accepts = ( env["Accepts"] ) ? env["Accepts"].gsub("/", "_") : "text_plain"

		case req.request_method
		when "GET", "POST", "PUT"
			if response.class == Hash  || response.class == Array
				status = 200
			else
				status = 404
			end
			body = [ formatResponse( response, accepts) ]
		when "DELETE"
			if response.class == TrueClass
				status = 204
				body = []
			else
				status 404
				body = [ formatResponse( response, accepts) ]
			end
		end

		header = headers req, accepts

		serverResponse = Rack::Response.new body, status, header

	end

	def formatResponse body, accepts
		send( accepts, body )
	end

	def application_json body
		JSON.generate body
	end

	def application_xml body
		body.to_xml
	end

	def text_plain body
		body
	end

	def headers req, accepts
		{
			'Content-Type'=>accepts.gsub( "_", "/" )
		}
	end

end


puts "XHR Test Suite logger listening on port #{ ServerPort }"

#Rack::Handler::Mongrel.run HTTPLogCollector.new, :Port=>ServerPort
Rack::Server.start :app=>XHRTestSuiteLogger.new, :server=>'webrick', :Port=>ServerPort, :AccessLog=>[]