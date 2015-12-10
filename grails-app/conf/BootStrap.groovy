import grails.plugin.springsecurity.SpringSecurityService

import com.csra.epa.domains.Role
import com.csra.epa.domains.User
import com.csra.epa.domains.UserRole

class BootStrap {

	SpringSecurityService springSecurityService

	void createUser(user,pass,role) {
		User theUser = new User(username:user,password:pass)
		theUser.save(flush:true)
		UserRole.create theUser, role, true
	}

	def init = { servletContext ->
		log.info 'Boostrapping'
		TimeZone.setDefault(TimeZone.getTimeZone("America/New_York"))
		try {
			if (UserRole.list().size() == 0) {
				Role adminRole = new Role(authority:'ROLE_ADMIN').save(flush:true)
				Role userRole = new Role(authority:'ROLE_USER').save(flush:true)

				createUser('admin','stbadmin2014',adminRole)
				createUser('user','stbuser2014',userRole)
			}
		} catch (Exception e) {
			log.error("Exception during bootstrap init", e)
		}
	}
}
