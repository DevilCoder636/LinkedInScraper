class BasicUserProfile{
    constructor(Name,Title,URL,Location,Followers,CurrentCompanyorCollege,ProfileImage,CoverImage){
        this.Name = Name;
        this.Title = Title;
        this.URL = URL;
        this.Location = Location;
        this.Followers = Followers;
        this.CurrentCompanyorCollege = CurrentCompanyorCollege;
        this.ProfileImage = ProfileImage;
        this.CoverImage = CoverImage;
    }
}

class UserContactInfo{
    constructor(LinkedInProfile,Phone,Address,Email,Birthday){
        this.LinkedInProfile = LinkedInProfile;
        this.Phone = Phone;
        this.Address = Address;
        this.Email = Email;
        this.Birthday = Birthday;
    }
}

class CompanyBasicProfile{
    constructor(URL,Name,TagLine,Domain,Followers,Employees,CompanyProfileImage,CompanyCoverImage){
        this.URL = URL;
        this.Name = Name;
        this.TagLine = TagLine;
        this.Domain = Domain;
        this.Followers = Followers;
        this.Employees = Employees;
        this.CompanyProfileImage = CompanyProfileImage;
        this.CompanyCoverImage = CompanyCoverImage;
    }
}

class CompanyAboutSection{
    constructor(Overview,Website,Phone,Industry,CompanySize,HeadQuarter,Founded){
        this.Overview = Overview;
        this.Website = Website;
        this.Phone = Phone;
        this.Industry = Industry;
        this.CompanySize = CompanySize;
        this.HeadQuarter = HeadQuarter;
        this.Founded = Founded;
    }
}

class MediumBlog {
    constructor(images = [], headings = [], paragraphs = []) {
        this.images = images;
        this.headings = headings;
        this.paragraphs = paragraphs;
    }
}

var local = "localhost:7199";
var env = local ;
var ProfileUrl;
var AvailDocument;

var AdminEmail;

function onWindowLoad() {
    const messagElement = document.getElementById("message");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        try {
            var activeTab = tabs[0];
            var activeTabId = activeTab.id;
            var activeTabUrl = activeTab.url;
            ProfileUrl = activeTabUrl;
            console.log(activeTabUrl);
            chrome.scripting.executeScript({
                target: { tabId: activeTabId },
                function: DOMtoString
            }, function (resultsArray) {
                try {
                    var results = resultsArray[0];
                    var message = document.getElementById('message');
                    //AvailDocument = results.result.result;
                    if (results && results.result) {
                        const parser = new DOMParser();
                        AvailDocument = parser.parseFromString(results.result.result, "text/html");
                        if (activeTabUrl.includes("medium")) {
                            console.log("Active Url Contains : Medium")
                            ScrapMediumBlog(AvailDocument);
                        } else if (activeTabUrl.includes("twitter")) {
                            console.log("Active Url Contains : Twitter");
                            ScrapTwitterInfo(AvailDocument);
                        } else if (activeTabUrl.includes("linkedin")) {
                            if (activeTabUrl.includes("company")) {
                                ScarpCompanyBasicProfile(AvailDocument);
                            } else {
                                var response = ScrapUserBasicProfile(AvailDocument);
                                PrintBasicUserInfo(response);
                            }
                        } else if (activeTabUrl == null || activeTabUrl.includes("chrome://newtab/")) {
                            messagElement.innerHTML = `
                                <h3>This Extension will only work for Linked In or Medium For Now</h3>
                            `;
                        } else {
                            messagElement.innerHTML = `
                                <h3>This Extension will only work for Linked In or Medium For Now</h3>
                            `;
                        }
                    } else {
                        message.innerText = 'Error getting the page source.';
                    }
                } catch (error) {
                    console.error('Error:', error);
                    message.innerText = 'An error occurred. Please try again.';
                }
            });
        } catch (error) {
            console.error('Error:', error);
            message.innerText = 'An error occurred. Please try again.';
        }
    });
}


document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    if (localStorage.getItem("isLoggedIn") === "true") {
        hideLoginForm();
        AdminEmail = localStorage.getItem("LoggedEmail");
        console.log(AdminEmail);
    }
    
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const apiUrl = `https://${env}/api/v1/ScraperUser/Signin/${username}/${password}`;
        
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        };
        
        fetch(apiUrl, options)
        .then(response => response.json())
        .then(data => {
            if (data === true) {
                console.log("Login successful");
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("LoggedEmail", document.getElementById("username").value); // Use setItem() to store the email
                // Call onWindowLoad() only when login is successful
                AdminEmail = localStorage.getItem("LoggedEmail"); // Retrieve the email after setting it
                hideLoginForm();
                console.log(AdminEmail);
            } else {
                console.error("Login failed");
                alert("Invalid username or password. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error occurred:", error);
            alert("An error occurred while trying to log in. Please try again later.");
        });
    });
});

function hideLoginForm() {
    const container = document.getElementById("container");
    container.style.display = "none";
    onWindowLoad();
}


// Other functions related to page scraping, etc.


function DOMtoString() {
    var selector = document.documentElement;
    return { result: selector.outerHTML };
}

function ScrapUserBasicProfile(AvailDocument){
    console.log("I am Scraping User Proflie");
   try{
    var Name = AvailDocument.querySelector("h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words")?.textContent.trim() || "Not able to Found User Name";
    var Title =  AvailDocument.querySelector("div.text-body-medium.break-words")?.textContent.trim() || "Not able to Found Title";
    var Company =  AvailDocument.querySelector("ul.pv-text-details__right-panel li")?.textContent.trim() || "Not able to Found Current Company or College";
    var Location = AvailDocument.querySelector("span.text-body-small.inline.t-black--light.break-words")?.textContent.trim() || "Not able to Found Current Location";
    var About =  AvailDocument.querySelector("div.display-flex.ph5.pv3 div.pv-shared-text-with-see-more")?.textContent.trim() || "Not able to Found About Section of User";
    // var about = doc.querySelector('div.pv-shared-text-with-see-more span')?.textContent.trim() || '';
    var FollowersandConnection = AvailDocument.querySelector("ul.pv-top-card--list-bullet")?.textContent.trim() || "Not able to Found Any Followers";
    var SelfPicture =  AvailDocument.querySelector("img.evi-image.ember-view.profile-photo-edit__preview")?.getAttribute("src") || "Not Able to Found Profile Picture";
    var UserProfilePicture = (AvailDocument.querySelector("img.pv-top-card-profile-picture__image")?.getAttribute("src") ||"Not Able to Found Profile Picture");
    var CoverImage = (AvailDocument.querySelector("img.profile-background-image__image ")?.getAttribute("src") || "Not Able to Found Cover Picture");
    var Picture = UserProfilePicture !== "Not Able to Found Profile Picture" ? UserProfilePicture : SelfPicture;
    
    var profile = new BasicUserProfile(Name,Title,ProfileUrl,Location,FollowersandConnection,Company,Picture,CoverImage);

    console.log(About);
    // if(profile != null)
    // {
    //     if(saveProfileData(profile)){
    //         alert("Profile Saved Successfully");
    //     }
       
    // }
    console.log(profile);
    return profile;
   }
   catch(error){
    console.error("Error in Scrap User Basic Profile " + error);
   }
}

function formatProfileName(name) {
    // Split the name into parts
    const parts = name.split(' ');

    // If there are multiple parts, join all but the last one with spaces
    if (parts.length > 1) {
        const firstName = parts.slice(0, -1).join(' ');
        return `${firstName}'s Profile`;
    } else {
        // If there's only one part, just append "'s Profile" to it
        return `${name}'s Profile`;
    }
}

function ScrapUserContactInfo(doc,profile) {
    try {
        var LinkedInPersonalProfileElement = doc.querySelector('.pv-contact-info-section__edit-action');
        var LinkedInUserProfileElement = doc.querySelector('.pv-contact-info__contact-type a[data-control-name="contact_see_more"]');
        
        var LinkedInProfile = (LinkedInPersonalProfileElement && LinkedInPersonalProfileElement.getAttribute('href')) ||
                             (LinkedInUserProfileElement && LinkedInUserProfileElement.getAttribute('href')) || null;

        // Get Contact Info Sections
        var contactSections = doc.querySelectorAll('.pv-contact-info__contact-type');

        // Define an object to store the contact information
        var contactInfo = {
            LinkedInProfile: LinkedInProfile,
            Email: '',
            Phone: '',
            Address: '',
            IM: '',
            Birthday: ''
        };

        var UserProfileName = formatProfileName(profile.Name);

        // Loop through each contact section and extract the information
        contactSections.forEach(function (section) {
            var header = section.querySelector('.pv-contact-info__header').textContent.trim();
            var infoContainer = section.querySelector('.pv-contact-info__ci-container');

            switch (header) {
                case UserProfileName:
                    // LinkedIn Profile
                    contactInfo.LinkedInProfile = infoContainer.querySelector('a').getAttribute('href');
                    break;
                case 'Phone':
                    // Phone
                    contactInfo.Phone = infoContainer.querySelector('span').textContent.trim();
                    break;
                case 'Address':
                    // Address
                    contactInfo.Address = infoContainer.querySelector('a').textContent.trim();
                    break;
                case 'Email':
                    // Email
                    contactInfo.Email = infoContainer.querySelector('a').textContent.trim();
                    break;
                case 'IM':
                    // IM
                    contactInfo.IM = infoContainer.querySelector('span').textContent.trim();
                    break;
                case 'Birthday':
                    // Birthday
                    contactInfo.Birthday = infoContainer.querySelector('span').textContent.trim();
                    break;
            }
        });

        var usercontactinfo = new UserContactInfo(contactInfo.LinkedInProfile, contactInfo.Phone, contactInfo.Address, contactInfo.Email, contactInfo.Birthday);
        console.log(usercontactinfo);
        if(usercontactinfo != null){
            PrintBasicContactInfo(usercontactinfo,profile);
        }
        else{
            const Details = document.getElementById("User-Account-Info");
            Details.innerHTML = `<h4>Please Click on Contact Info</h4>`;
        }
        // Return the contact information object
        return usercontactinfo;
    } catch (error) {
        console.error('Error scraping contact info:', error);
        return null;
    }
}

function ScarpCompanyBasicProfile(doc){
    try{
        var CompanyName = doc.querySelector("h1.org-top-card-summary__title.text-display-medium-bold.full-width")?.textContent.trim() || "Not Able to Found Company Name";
        var TagLine = doc.querySelector("p.org-top-card-summary__tagline")?.textContent.trim() || "Not Able to Found Tagline";
        var Domain = doc.querySelector("div.org-top-card-summary-info-list__info-item")?.textContent.trim() || "Not Able to Found Domain";
        var Followers = doc.querySelector("div.org-top-card-summary-info-list__info-item:nth-child(2)")?.textContent.trim() || "Not Able to Found Followers";
        var test = doc.querySelector("div.mb4.t-black--light.text-body-medium span.link-without-visited-state")?.textContent.trim() || "Not Find";
        var Domain = doc.querySelector("div.org-top-card-summary-info-list__info-item")?.textContent.trim() || "Not Able to Found Company Domain";
        var TotalEmployess = doc.querySelector("span.t-normal.t-black--light.link-without-visited-state.link-without-hover-state")?.textContent.trim() || "Not Able to Found Company Total Employees";
        var CompanyImageUrl = doc.querySelector("img.evi-image.lazy-image.ember-view.org-top-card-primary-content__logo")?.getAttribute("src") || "Not Able to Found Company Profile Picture";
        var CompanyCoverImageUrl = doc.querySelector("img.pic-cropper__target-image")?.getAttribute("src") || "Not Able to Found Company Cover Picture";
        var divElement = doc.querySelector('.org-cropped-image__cover-image.background-image')?.getAttribute("style") || null;
        console.log(divElement);
        if(divElement != null){

            var imageUrlMatch = divElement.match(/url\(['"]?(.*?)['"]?\)/);
        }

        // Check if a match is found
        if (imageUrlMatch) {
            var imageUrl = imageUrlMatch[1];
            console.log('Image URL:', imageUrl);
        } else {
            console.log('No image URL found.');
        }
        var CoverCompImage = CompanyCoverImageUrl !== "Not Able to Found Company Cover Picture" ? CompanyCoverImageUrl : imageUrl;

            var companybasicdetails = new CompanyBasicProfile(ProfileUrl,CompanyName,TagLine,Domain,Followers,TotalEmployess,CompanyImageUrl,CoverCompImage);
            PrintCompanyBasicProfile(companybasicdetails);
            return companybasicdetails;
        }
    catch(error){
        console.error("Error in Scrap Company Basic Profile " + error);
        return null;
    }
}

function ScrapCompanyAboutSection(doc,profile){
    try{
        var overviewSection = doc.querySelector(".org-page-details-module__card-spacing");

        // Extracting data
        var overviewTitle = overviewSection.querySelector("h2.text-heading-xlarge")?.textContent.trim() ?? "Not able to Found Overview";
        var overviewText = overviewSection.querySelector("p.text-body-medium")?.textContent.trim() ?? "Not able to Overview Text";
        var websiteElement = findElementByText(overviewSection, "Website");
        var website = websiteElement ? websiteElement.nextElementSibling.textContent.trim() : "Not able to Found Any Company Website";
        var industry = findElementByText(overviewSection, "Industry")?.nextElementSibling.textContent.trim() ?? "Not able to Found Company Industry";

        // Extract Company Size and Specialties
        var companySizeElement = findElementByText(overviewSection, "Company size");
        var companySize = companySizeElement ? companySizeElement.nextElementSibling.textContent.trim() ?? "" : "Not able to Found Company Size or may be Company Not Mentioned in Profile";

        var specialtiesElement = findElementByText(overviewSection, "Specialties");
        var specialties = specialtiesElement ? specialtiesElement.nextElementSibling.textContent.trim() ?? "" : "Not able to Found Any Speacilities or may be Company Not Mentioned in Profile";

        var PhoneNumber = findElementByText(overviewSection,"Phone");
        var phonenumber = PhoneNumber ? PhoneNumber.nextElementSibling.textContent.trim() ?? "": "Not able to Found any Phone Number or may be Company Not Mentioned in Profile";

        var Founded = findElementByText(overviewSection, "Founded");
        var founded = Founded ? Founded.nextElementSibling.textContent.trim() ?? "": "Not able to Found any Foundation Year or may be Company Not Mentioned in Profile"

        var headquarters = findElementByText(overviewSection, "Headquarters")?.nextElementSibling.textContent.trim() ?? "Not able to Found HeadQuarter or may be Company Not Mentioned in Profile";

        var companyabout = new CompanyAboutSection(overviewTitle,website,phonenumber,industry,companySize,headquarters,founded);

        // Log the data
        console.log("Overview Title:", overviewTitle);
        console.log("Overview Text:", overviewText);
        console.log("Website:", website);
        console.log("Industry:", industry);
        console.log("Company Size:", companySize);
        console.log("Headquarters:", headquarters);
        console.log("Specialties:", specialties);

        // Function to find an element by its text content
        function findElementByText(parentElement, text) {
            var elements = parentElement.querySelectorAll("dt");
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].textContent.trim() === text) {
                    return elements[i];
                }
            }
            return null;
        }
        console.log(companyabout);
        PrintCompanyAboutSection(companyabout,profile);
        return companyabout;
    }
    catch(error){
        console.error("Error in Scraping About Section " + error);
        return null;
    }
}

function ScrapMediumBlog(doc) {
    try {
        
        var images = [];
        var headings = [];
        var paragraphs = [];
        
        var Title = doc.querySelector("h1.pw-post-title")?.textContent.trim() || "Title Not Found";
        console.log("Title:", Title);
        
        var AllImages = doc.querySelectorAll("img");
        if (AllImages.length > 0) {
            AllImages.forEach((image, index) => {
                var imageSrc = image.getAttribute("src") || "Image Not Found";
                console.log(`Image ${index + 1}:`, imageSrc);
                images.push(imageSrc);
            });
        } else {
            console.log("Images Not Found");
        }
        
        var authors = document.querySelectorAll("a");
        if (authors.length > 0) {
            authors.forEach((author, index) => {
                var authorName = author.textContent.trim() || "Text Not Found";
                console.log(`Author ${index + 1}:`, authorName);
            });
        } else {
            console.log("Authors Not Found");
        }
        
        
        var AllHeadings = doc.querySelectorAll("h1");
        if (AllHeadings.length > 0) {
            AllHeadings.forEach((heading, index) => {
                var headingText = heading.textContent.trim() || "Heading Not Found";
                console.log(`Heading ${index + 1}:`, headingText);
                headings.push(headingText);
            });
        } else {
            console.log("Headings Not Found");
        }
        
        var PostParagraphs = doc.querySelectorAll("p.pw-post-body-paragraph");
        if (PostParagraphs.length > 0) {
            PostParagraphs.forEach((paragraph, index) => {
                var paragraphText = paragraph.textContent.trim() || "Paragraph Not Found";
                console.log(`Paragraph ${index + 1}:`, paragraphText);
                paragraphs.push(paragraphText);
            });
        } else {
            console.log("Paragraphs Not Found");
        }
        
        var medium = new MediumBlog(images,headings,paragraphs);
        console.log(medium);
        PrintMediumBlog(medium);
        return medium;
        
    } catch (error) {
        console.error("Error in Scraping Medium Blog ... " + error);
        return null;
    }
}

function ScrapTwitterInfo(doc) {
    try {
        // Try to fetch Name from the original selector
        var NameElement = document.getElementsByClassName("css-1rynq56");
        // var Name = NameElement?.textContent.trim() || "Name Not Found";
        console.log(NameElement);

        // If Name is not found, fetch it from the parent component's HTML
        if (Name === "Name Not Found") {
            var parentElement = document.querySelector(".css-1rynq56"); // Update the selector as needed
            if (parentElement) {
                Name = parentElement.outerHTML || "Name Not Found (from parent)";
                console.log("Name from Parent:", Name);
            } else {
                console.log("Parent Element Not Found");
            }
        }

        var twitterNames = document.querySelectorAll(".css-1qaijid");
        console.log(twitterNames.length);
        if (twitterNames.length > 0) {
            twitterNames.forEach((twitterName, index) => {
                var name = twitterName.textContent.trim() || "Text Not Found";
                console.log(`Twitter ${index + 1}:`, name);
            });
        } else {
            console.log("Twitter Names Not Found");
        }

        var AllImages = doc.querySelectorAll("img");
        if (AllImages.length > 0) {
            AllImages.forEach((image, index) => {
                var imageSrc = image.getAttribute("src") || "Image Not Found";
                console.log(`Image ${index + 1}:`, imageSrc);
            });
        } else {
            console.log("Images Not Found");
        }
    } catch (error) {
        console.error("Error in Scraping Twitter info ... " + error);
    }
}

async function AskQuestionToAI(url){
    const baseUrl = 'https://admin.wizar.io/api/WizarAI/LetsChat/';

    const query =  encodeURIComponent(url + " Acc to this url this is user or company profile"); // Encode the text for URL
    console.log(query);
    const apiUrl = `${baseUrl}${query}`;
    
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    try {
        const response = await fetch(apiUrl, requestOptions);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log(JSON.stringify(data));
            return JSON.stringify(data);
        } else {
            const text = await response.text();
            console.log(JSON.stringify(text));
            return JSON.stringify(text);
           // speakText(text); // Convert the response text to speech
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function PrintBasicUserInfo(profile) {
    const Profile = document.getElementById("profile-data");
    Profile.innerHTML = `
        <div class="userInfocontainer">
            <label>Profile Image</label>
            <img src='${profile.ProfileImage}' width="130px" height="150px"/>
            
            <label>Cover Image</label>
            <img src='${profile.CoverImage}' width="130px" height="150px"/>
            
            <h3>Name : ${profile.Name} </h3>
            <p>Title : ${profile.Title} </p>
            <p>Location : ${profile.Location} </p>
            <p>Current Company / College : ${profile.CurrentCompanyorCollege} </p>
            <p>For Contact Info... </p>
            <p>Click on Contact Info.. Right Side of Location of User</p>
            <button id="PrintcontactInfo">Fetch Contact Info</button>
        </div>
    `;
    
    const PrintContactInfo = document.getElementById("PrintcontactInfo");
    PrintContactInfo.addEventListener("click", function () {
        ScrapUserContactInfo(AvailDocument,profile);
    });
}

function PrintBasicContactInfo(details,profile) {
    const Details = document.getElementById("User-Account-Info");
    if(details.Phone != "" || details.Address != "" || details.Email != "" || details.Birthday != ""){
        Details.innerHTML = `
            <div class="UserContactInfoContainer">
                <p> Linked In Profile : ${details.LinkedInProfile} </p>
                <p> Phone : ${details.Phone} </p>
                <p> Address : ${details.Address} </p>
                <p> Email : ${details.Email} </p>
                <p> Birthday : ${details.Birthday} </p>
                <button id="SaveUserInfo">Save Profile</button>
                <br/>
            </div>
        `;
    }
    else{
        SaveWithContactInfo();
    }
    const SaveProfile = document.getElementById("SaveUserInfo");
    SaveProfile.addEventListener("click", function () {
        // Call a function to send the data to the API
        const Details = document.getElementById("User-Account-Info");
        Details.innerHTML = ``;
        saveProfileContactData(profile,details);
    });
}
function SaveWithContactInfo(details,profile) {
    const Details = document.getElementById("User-Account-Info");
        Details.innerHTML = `
            <div class="UserContactInfoContainer">
            <h4 style="color: Red;">Click on Contact Info ( If Already Clicked Then This User May Not be Shared His Details on Linked-In) </h4>
            
                <button id="SaveUserInfo">Save Profile</button>
                <br/>
            </div>
        `;
    
    const SaveProfile = document.getElementById("SaveUserInfo");
    SaveProfile.addEventListener("click", function () {
        // Call a function to send the data to the API
        saveProfileContactData(profile,details);
    });
}

// Assume 'profile' is an instance of CompanyBasicProfile
function PrintCompanyBasicProfile(profile) {
    const companyProfile = document.getElementById("company-profile-data");
    companyProfile.innerHTML = `
    <div class="userInfocontainer">
        <img src='${profile.CompanyProfileImage}' width="130px" height="150px"/>
        <img src='${profile.CompanyCoverImage}' width="130px" height="150px"/>
        <h3>Company Name: ${profile.Name}</h3>
        <p>TagLine: ${profile.TagLine}</p>
        <p>Domain: ${profile.Domain}</p>
        <p>Followers: ${profile.Followers}</p>
        <p>Employees: ${profile.Employees}</p>
        <h4 style="color : Green;"> For Contact Click on About Section </h4>
        <button id="PrintCompanyInfo"> Fetch About Info </button>
    </div>
    `;

    const PrintCompanyInfo = document.getElementById("PrintCompanyInfo");
    PrintCompanyInfo.addEventListener("click", function () {
        ScrapCompanyAboutSection(AvailDocument,profile);
    });
}


// Assume 'aboutSection' is an instance of CompanyAboutSection
function PrintCompanyAboutSection(aboutSection,profile) {
    const companyAbout = document.getElementById("company-about-data");
    companyAbout.innerHTML = `
    <div class="userInfocontainer">
        <h3>${aboutSection.Overview}</h3>
        <p>Website: ${aboutSection.Website}</p>
        <p>Phone: ${aboutSection.Phone}</p>
        <p>Industry: ${aboutSection.Industry}</p>
        <p>Company Size: ${aboutSection.CompanySize}</p>
        <p>Headquarters: ${aboutSection.HeadQuarter}</p>
        <p>Founded: ${aboutSection.Founded}</p>
        <br/>
        <button id="SaveCompanyInfo">Save</button>
        </div>
    `;

    const SaveButton = document.getElementById("SaveCompanyInfo").addEventListener("click",function(){
        // Call a function to send the data to the API
        SaveCompanyData(profile,aboutSection);
    })
}

// Assume 'mediumBlog' is an instance of MediumBlog
function PrintMediumBlog(mediumBlog) {
    const mediumBlogData = document.getElementById("medium-blog-data");

    if (mediumBlog.images.length > 0) {
        mediumBlog.images.forEach((image, index) => {
            mediumBlogData.innerHTML += `<img src='${image}' alt='Medium Blog Image ${index + 1}' />`;
        });
    }

    if (mediumBlog.headings.length > 0) {
        mediumBlog.headings.forEach((heading, index) => {
            mediumBlogData.innerHTML += `<h3>${heading}</h3>`;
        });
    }

    if (mediumBlog.paragraphs.length > 0) {
        mediumBlog.paragraphs.forEach((paragraph, index) => {
            mediumBlogData.innerHTML += `<p>${paragraph}</p>`;
        });
    }
}


function saveProfileData(profileData) {
    // Make a POST request to your API endpoint
    const apiUrl = `https://${env}/api/LinkedInData/AddProfile/Company/Contact`;
    //const apiUrl = "https://admin.wizar.io/api/LinkedInData/AddProfile";
    const ApiResult = document.getElementById("Api-Response");
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*"
        },
        body: JSON.stringify({
            id: "", // Assuming Id is part of the profileData
            name: profileData.Name,
            title: profileData.Title,
            url: profileData.URL,
            location: profileData.Location,
            currentCompany: profileData.CurrentCompanyorCollege,
            followerAndConnection: profileData.Followers,   
            userImgUrl: profileData.ProfileImage,
            userCoverUrl: profileData.CoverImage
        })
    })
    

    .then(response => {
        if (response.ok) {
            ApiResult.innerHTML = `
            <p>Data Saved Successfully!!</p>
            `;
            alert("Data Saved Succesfully");
            console.log("Profile data saved successfully!");
            return true;
        } else {
            ApiResult.innerHTML = `
            <p>Something is wrong Data Not Saved!!!</p>
            `;
            alert("Some Thing is Wrong in API");
            console.error("Error saving profile data:", response.statusText);
            return false;
        }
    })
    .catch(error => {
        console.error("Error saving profile data:", error);
    });
}

function PolishUrl(url) {
    if (url.includes("/overlay/contact-info/")) {
        url = url.replace("/overlay/contact-info/", "");
    }
    if(url.includes("/about/")){
        url = url.replace("/about/","");
    }
    return url;
}



function saveProfileContactData(profileData, aboutData) {
    // Make a POST request to your API endpoint
    
    const apiUrl = `https://${env}/api/LinkedInData/AddProfile/User/Contact/`;
    //const apiUrl = "https://admin.wizar.io/api/LinkedInData/AddProfile";
    const ApiResult = document.getElementById("Api-Response");
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*"
        },
        body: JSON.stringify({
            id: "", // Assuming Id is part of the profileData
            name: profileData.Name,
            title: profileData.Title,
            url: PolishUrl(profileData.URL),
            adminEmail : AdminEmail,
            location: profileData.Location,
            currentCompany: profileData.CurrentCompanyorCollege,
            followerAndConnection: profileData.Followers,   
            userImgUrl: profileData.ProfileImage,
            userCoverUrl: profileData.CoverImage,
            isSelected: false,
            phone: aboutData.Phone,
            email: aboutData.Email,
            address: aboutData.Address,
            birthday: aboutData.Birthday
        })
    })
    .then(response => {
        if (response.ok) {
            ApiResult.innerHTML = `
            <p>Data Saved Successfully!!</p>
            `;
            alert("Data Saved Succesfully");
            console.log("Profile data saved successfully!");
            return true;
        } else {
            ApiResult.innerHTML = `
            <p>Something is wrong Data Not Saved!!!</p>
            `;
            alert("Some Thing is Wrong in API");
            console.error("Error saving profile data:", response.statusText);
            return false;
        }
    })
    .catch(error => {
        alert("Some Thing is Wrong in API");
        console.error("Error saving profile data:", error);
    });
}


function SaveCompanyData(profileData, aboutData) {
    console.log(profileData);
    console.log(aboutData);
    // Make a POST request to your API endpoint
    const apiUrl = `https://${env}/api/LinkedInData/AddProfile/Company/Contact`;
    // const apiUrl = "https://admin.wizar.io/api/LinkedInData/AddProfile";
    const ApiResult = document.getElementById("Api-Response");

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*"
        },
        body: JSON.stringify({
            "id": "",
            "url": PolishUrl(profileData.URL),
            "adminEmail" : AdminEmail,
            "name": profileData.Name,
            "tagLine": profileData.TagLine,
            "domain": profileData.Domain,
            "followers": profileData.Followers,
            "employees": profileData.Employees,
            "companyProfileImage": profileData.CompanyProfileImage,
            "companyCoverImage": profileData.CompanyCoverImage,
            "overview": aboutData.Overview,
            "website": aboutData.Website,
            "phone": aboutData.Phone,
            "industry": aboutData.Industry,
            "companySize": aboutData.CompanySize,
            "headQuarter": aboutData.HeadQuarter,
            "founded": aboutData.Founded
          })
    })
    .then(response => {
        if (response.ok) {
            ApiResult.innerHTML = `
                <p>Data Saved Successfully!!</p>
            `;
            alert("Data Saved Succesfully");
            console.log("Profile data saved successfully!");
            return true;
        } else {
            ApiResult.innerHTML = `
            <p>Something is wrong Data Not Saved!!!</p>
            `;
            alert("Some Thing is Wrong in API");
            console.error("Error saving Company Contact data:", response.statusText);
            return false;
        }
    })
    .catch(error => {
        alert("Some Thing is Wrong in API");
        console.error("Error saving profile data:", error);
    });
}

function saveFollowersAndConnections(text) {
    const followersRegex = /(\d+(,\d{3})*) followers?/;
    const connectionsRegex = /(\d+(,\d{3})*)\+? connections?/;

    const followersMatch = text.match(followersRegex);
    const connectionsMatch = text.match(connectionsRegex);

    let followers = 0;
    let connections = 0;

    if (followersMatch) {
        followers = parseInt(followersMatch[1].replace(',', ''), 10);
    }

    if (connectionsMatch) {
        connections = parseInt(connectionsMatch[1].replace(',', ''), 10);
    }

    // You can save the values to variables or data structures here
    console.log("Followers:", followers);
    console.log("Connections:", connections);
    console.log(typeof(followers));

    // If you want to return the values for further processing, you can do so
    return { followers, connections };
}

