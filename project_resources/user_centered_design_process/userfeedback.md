###Day 1:

General:
- Rename the tool to encompass more than just EPA
- Document vision for both immediate and historical view of the data to support multiple use cases
- Address IE 9 functionality issues (MVP) and look/feel (not MVP)

Landing page:
- Remove RAD logo, move CSRA logo to bottom right and make it smaller
- About “About this tool” link top right, open new page with content TBD
- In search box, update text to read “Enter address, city, state and/or zipcode

Search results:
- Ensure results exclude international data
- Allow users to export data (not MVP)
- On water contaminants card, make links to specific violation types look “clickable”
- Within water contaminants modal, rename date fields to be something more intuitive
- Add tool tips to define each column header
- Create linkage to substance registry service from contaminant names to allow users to learn more about an individual contaminant 

###Day 2:

General:
- Update placeholder/intro text throughout

Landing Page: 
- Consider allowing users to sign up for notifications on the landing page as well

Air Quality card:
- Need to define chemicals with rollovers: what are they, in English, and why do they matter?
- Need to create rollovers attached to a question icon to tell you more about a card. Those should be pulling from the master “About this site” page.
- Users appreciated groupings by type of card (Air info appears together) 
- Need legend for air quality. Also user was unsure what the dates meant--is that month/year or month/day? Is it projecting data--12/17 appears now but it's 12/16.
- can we center the dates and dots? looks a little off

UV Index: 
- need a legend or scale. Help users understand the "score" ("Is a 2 good? I see it's low, but compared to what?")

Water Quality card:
- list is more important than the map--explore design options that place more prominence on the list. user was also unsure what the map was depicting: is it everything? is it just what I have chosen to expose in the list?

###Day 3:

About this site: 
- Need to update heading in modal to match button label. Also, consider moving the link to the green header bar--user confused the "about" content as contextual help and saw it was more general--perhaps should be treated as a utilty-type link
- Discuss why we want this in a modal--may want a page with more flexibility to add content and updates re: the tool down the line

Search results: 
- Entering nothing in to the search box still generates results. Consider adding an error. 
- Air Quality card still causing some confusion. "If this is a forecast, why is it showing yesterday's score?" also, it's still unclear that this is month and day. Perhaps change format to be Thu Dec 17, Fri Dec 18 and so forth. Maybe with Thu on top and Dec 17 underneath? Also need to indicate how often each card is updated--daily? hourly?
- Water quality: List needs ability to keep both types open at once. Also, looks like pin count doesn't match the total locations in the list. Is this a bug?
- Water quality: we are highlighting the most recent (in the last year) violations with an alert and highlighting rows in the tables. Possible backlog item would be exploring color coding or using a different icon for pins on facilities that fall in to that category to better unify the interface for that card and reinforce the overall concept that this data is meant to focus you on the most recent information in these areas. 
- Water quality: heard from users how "bad" their water quality violations are--is three bad? how does this compare to other areas? perhaps something for the backlog.
