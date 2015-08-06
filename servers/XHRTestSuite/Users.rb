ErrorMessages = 
{
	:not_found => "The requested user could not be found",
	:user_hash_expected => "user {} is expected to be a hash",
	:user_id_expected => "UPDATE: user {} and id int are expected parameters"
}

class Users
	attr_accessor :users, :currentId
	@currentId
	@users
	
	def initialize
		if @currentId.nil?
			@currentId = 0
		end
		
		if @users.class != Array
			@users = Array.new
		end
	end

	def add user 
		if user.class == Hash
			user[ "id" ] = "#{@currentId}"
			@users.push user 
			@currentId += 1
			response = user
		else 
			response = ErrorMessages[ :user_hash_expected ]
		end	
		puts response
		return response
	end
	
	def remove id 
		deleted = @users.reject!{ |user| user[ "id" ] == id }
		(deleted.nil?) ? ErrorMessages[ :not_found ] : true
	end
	
	def update user, id 

		if user.class != Hash
			response = ErrorMessages[ :user_hash_expected ]
		else 
			userIndex = findIndexBy id 
			currentUser = @users[ userIndex ]

			if currentUser.nil? || userIndex.nil?
				response = ErrorMessages[ :not_found ]
			else
				user.each do |key,value| 
					currentUser[ key ] = value
				end
				
				@users[ userIndex ] = currentUser
				
				response = currentUser
			end
		end

		return response
	end
	
	def get id 
		userIndex = findIndexBy id 

		if( userIndex.nil? )
			response = ErrorMessages[ :not_found ]	
		else
			response = @users[ userIndex ]
		end

		return response
	end
	
	def list
		@users
	end

	def findIndexBy id 
		index = @users.index { |user| user[ "id" ] == id }
	end
end