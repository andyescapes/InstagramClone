import API from './api.js';
import {
    like_post,
    unfollow_user,
    post_image,
    delete_post,
    update_post,
    post_comment,
    update_profile,
    load_feed
} from './api.js';
// A helper you may want to use when uploading new images to the server.
import {
    fileToDataUrl,
    clear_profile,
    clear_feed,
    add_post_editing_for_profile_view,
    add_follower_suggester,
    add_comment_button_handler,
    add_like_list,
    add_like_button
} from './helpers.js';

//global variable as the token
let token

//gathering dom elements
const username_field = document.getElementById("username")
const pw_field = document.getElementById("password")
const confirm_pw_field = document.getElementById("password_confirm")

const login = document.getElementById("login")
const register = document.getElementById("register")
const feed = document.getElementById("feed")
const login_link = document.getElementById("login_link")
const register_user = document.getElementById("register_user")
const profile_view = document.getElementById("profile_view")


//infinite scrolling capability
let profile_mode = false
window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 1) {
        if (profile_mode === false) load_feed(token, create_post, feed_counter)
    }
};

//button to reveal the form details
const details_form = document.getElementById("edit_profile_div")
details_form.style.display = "none"
document.getElementById("edit_details_button").addEventListener('click', () => {
    details_form.style.display == "none" ? details_form.style.display = "block" : details_form.style.display = "none"
})

//submitting the edited profile details
document.getElementById("submit_details").addEventListener("click", () => {
    const new_email = document.getElementById("new_email")
    const new_name = document.getElementById("new_name")
    const new_password = document.getElementById("new_password")
    update_profile(token, new_email.value, new_name.value, new_password.value)
    if (new_email.value != false) document.getElementById("profile_email").innerText = `Email: ${document.getElementById("new_email").value}`
    if (new_name.value != false) document.getElementById("profile_name").innerText = `Name: ${document.getElementById("new_name").value}`
    details_form.style.display = "none"
})

//implementing the feed/home button
document.getElementById("feed_link").addEventListener('click', () => {
    feed_counter = { count: 0 }
    document.getElementById("profile_view_posts").classList.remove("post")
    feed.style.display = "block"
    profile_view.style.display = "none"
    clear_profile()
    clear_feed()
    load_feed(token, create_post, feed_counter)
    profile_mode = false
})

//implementing the my profile button 
document.getElementById("my_profile").addEventListener('click', () => {
    feed_counter = 0
    clear_profile()
    if (token) {
        feed.style.display = "none"
        profile_view.style.display = "block"
        set_user_profile("", true)
        profile_mode = true
    }
})
export let error = (err) => {
    document.getElementById("error").style.display = "block"
    document.getElementById("error_message").innerText = `And error has occured: ${err}`
}
export let pop_up_message = (msg) => {
        document.getElementById("error").style.display = "block"
        document.getElementById("error_message").innerText = `${msg}`
    }
    //adding exit functionality to popup
document.getElementById("exit_popup").addEventListener('click', (event) => {
    document.getElementById("error").style.display = "none"
})

//New post modal creation
document.getElementById("new_post").addEventListener('click', () => {
    document.getElementById("post_modal").style.display = "block"
})
document.getElementById("exit_post_modal").addEventListener('click', (event) => {
    document.getElementById("post_modal").style.display = "none"
})
document.getElementById("post_button").addEventListener("click", () => {
    fileToDataUrl(document.getElementById("input_src").files[0]).then(
        res => {
            console.log(res)
            const split_64_encoded = res.split(",")
            console.log(split_64_encoded[1])
            post_image(token, document.getElementById("input_desc").value, split_64_encoded[1])
        }
    )

})

////////////////////////
// Registering a user //
////////////////////////

register_user.addEventListener('click', (event) => {
    const reg_pw_field = document.getElementById("reg_password")
    const reg_pw_field_confirm = document.getElementById("reg_password_confirm")

    if (reg_pw_field.value !== reg_pw_field_confirm.value) {
        error("An error has occured: Passwords do not match")
    } else {
        const signup_body = JSON.stringify({
            "username": document.getElementById("reg_username").value,
            "password": reg_pw_field.value,
            "email": document.getElementById("reg_email").value,
            "name": document.getElementById("reg_name").value
        })
        fetch("http://127.0.0.1:5000/auth/signup/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: signup_body
        }).then(data => {
            if (data.status === 200) {
                feed.style.display = "block"
                register.style.display = "none"
            }
            data.json().then(result => {
                if (!result.token) {
                    error(result.message)
                } else {
                    console.log(result)
                    token = result.token
                    load_feed(token, create_post, feed_counter)
                }
            })
        })
    }
})
document.getElementById('register_button').addEventListener('click', (event) => {
    login.style.display = "none"
    register.style.display = "block"

})

///////////////////////
// Logging in a user //
///////////////////////

document.getElementById('login_button').addEventListener('click', (event) => {

    if (pw_field.value !== confirm_pw_field.value) {
        error("Passwords do not match")
    } else {
        const login_body = JSON.stringify({
            "username": username_field.value,
            "password": pw_field.value
        })
        fetch("http://127.0.0.1:5000/auth/login/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: login_body
        }).then((data) => {
            if (data.status === 200) {
                login.style.display = "none"
                feed.style.display = "block"
            }
            data.json().then(result => {
                if (!result.token) {
                    error(result.message)
                } else {
                    console.log(result)
                    token = result.token
                    load_feed(token, create_post, feed_counter)
                }
            })
        })
    }
})
login_link.addEventListener('click', () => {
    login.style.display = "block"
    register.style.display = "none"

})

////////////////////////
// Creating User Feed //
////////////////////////

//set where we should start searching for feed results for infinite scrolling
let feed_counter = { count: 0 }

//creating post helper functions
let get_post = (id, token) => {
    const res = fetch(`http://127.0.0.1:5000/post/?id=${id}`, {
        headers: {
            'Authorization': `Token ${token}`
        },
    })
    return res
}
let get_user = (id, identifier) => {
    const res = fetch(`http://127.0.0.1:5000/user/?${identifier}=${id}`, {
        headers: {
            'Authorization': `Token ${token}`
        },
    })
    return res
}

//function that creates post on the feed and on the user's profile
let create_post = (src, description, name, comments, post_time, likes, id, profile = false, my_profile = false) => {
    //adding the heading to the post
    const div = document.createElement('div')
        //adding the image
    const image = document.createElement('img')
    image.alt = `A photo posted by ${name}`
    image.src = `data:imge/jpeg;base64, ${src}`

    //adding a link the users profile via their name
    const name_heading = document.createElement("h3")
    name_heading.className = "name_position"
    name_heading.innerText = name
    name_heading.classList.add("like_link")
    name_heading.addEventListener('click', (event) => {
        document.getElementById("feed").style.display = "none"
        profile_view.style.display = "block"
        set_user_profile(name)
    })

    const p = document.createElement("p")
    p.innerText = description

    //creating like count that can be clicked to show likes
    const like_count = document.createElement("h4")
    like_count.innerText = `Likes: ${likes.length}`

    //creating a list of likes from clicking on the like count
    const like_list = document.createElement("div")
    add_like_list(likes, like_list, get_user)
    like_list.style.display = "none"
    like_count.className = "like_link"

    //allowing like count to be clicked to show who liked the post
    like_count.addEventListener('click', (event) => {
        like_list.style.display === "none" ? like_list.style.display = "block" : like_list.style.display = "none"
    })

    const like_button = add_like_button(like_post, get_post, id, token, like_count, like_list, get_user)

    //creating comment count
    const comment_no = document.createElement("h4")
    comment_no.innerText = `Comments: ${comments.length}`
    comment_no.className = "like_link"
    const comment_list = document.createElement("div")

    //allowing comment count to be clicked to show comments
    comment_list.style.display = "none"
    comment_no.addEventListener('click', (event) => {
        comment_list.style.display === "none" ? comment_list.style.display = "block" : comment_list.style.display = "none"
    })

    //Gathering the correct forat for post date
    const post_time_heading = document.createElement("h4")
    const date_obj = new Date(post_time * 1000)
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    post_time_heading.innerText = `${date_obj.getDate()} ${monthNames[date_obj.getMonth()]}`;
    post_time_heading.className = "date_position"

    //appending post elements to the div
    div.appendChild(name_heading)
    div.appendChild(post_time_heading)
    add_post_editing_for_profile_view(my_profile, div, id, id_to_update, delete_post, token)
    div.appendChild(image)
    div.appendChild(like_count)
    div.appendChild(like_list)
    div.appendChild(p)
    div.appendChild(comment_no)

    //adding the comment list
    comments.map(comment => {
        const temp = document.createElement("h6")
        temp.innerText = comment.comment
        comment_list.appendChild(temp)
    })
    div.appendChild(comment_list)

    //adding comment post functionality
    const comment_input = document.createElement("input")
    div.appendChild(comment_input)
    const comment_submit = document.createElement("button")
    comment_submit.innerText = "Post"
    div.appendChild(comment_submit)

    add_comment_button_handler(comment_submit, comment_input, comment_no, post_comment, id, token, comment_list)
    div.appendChild(like_button)
    div.className = "post"
    profile === true ? document.getElementById("profile_view_posts").appendChild(div) : document.getElementById("feed").appendChild(div)
}

///////////////////////////
// Creating User Profile //
///////////////////////////

// showing the follower list on the user profile
document.getElementById("following_list").style.display = "none"
document.getElementById("profile_following").addEventListener('click', (event) => {

    following_list.style.display == "none" ? following_list.style.display = "block" : following_list.style.display = "none"
})

//setting the user profile
let set_user_profile = (name, my_profile = false) => {
    get_user(name, "username").then(
        data => data.json()
        .then(
            res => {
                //collecting the user's details
                console.log(res)
                document.getElementById("profile_username").innerText = `Username: ${res.username}`
                document.getElementById("profile_email").innerText = `Email: ${res.email}`
                document.getElementById("profile_name").innerText = `Name: ${res.name}`
                document.getElementById("profile_following").innerText = `Following: ${res.following.length}`
                document.getElementById("profile_followers").innerText = `Followers: ${res.followed_num}`

                const following_list = document.getElementById("following_list")
                let div_to_append = document.getElementById("find_friends")
                const friend_message = document.createElement("h3")
                friend_message.innerText = "Looking for people to follow?"
                friend_message.id = "friend_message"
                div_to_append.appendChild(friend_message)

                add_follower_suggester(div_to_append, my_profile, res, get_user, token)

                my_profile == true ? div_to_append.style.display = "block" : div_to_append.style.display = "none"

                //creating follower list
                res.following.map(follower => {
                    const temp = document.createElement("h6")
                    get_user(follower, "id").then(
                        data => data.json()
                        .then(username => {
                            temp.innerText = username.username + " "
                            following_list.appendChild(temp)

                            const unfollow_button = document.createElement("button")
                            unfollow_button.innerText = "Unfollow"

                            unfollow_button.addEventListener('click', () => {
                                unfollow_user(token, username.username)
                                temp.style.display = "none"
                            })
                            temp.appendChild(unfollow_button)
                        })
                    )
                })

                //generating the user's posts on their profile
                const reversed_posts = res.posts.reverse()
                reversed_posts.map(post_id => {
                    get_post(post_id, token).then(
                        data => data.json()
                        .then(
                            post_info => {
                                console.log(post_info)
                                create_post(post_info.src, post_info.meta.description_text, post_info.meta.author,
                                    post_info.comments, post_info.meta.published, post_info.meta.likes, post_info.id, true, my_profile)
                            }
                        )
                    )
                })
            }
        )
    )
}

//updating user post description event handle
let id_to_update = { id: "" }
document.getElementById("update_button").addEventListener('click', () => {
    update_post(id_to_update.id, token, document.getElementById("update_desc").value)
    document.getElementById("update_modal").style.display = "none"

})

/////////////////////////////////
// Creating push notifications //
/////////////////////////////////

const follower_posts = {}
let count = 0
const notif_div = document.getElementById("notifications")
notif_div.style.display = "none"
setInterval(function() {
    if (token && follower_posts != false) {
        //first call to get the current user's information
        get_user().then(
            data => data.json().then(
                result => {
                    let following_count = result.following.length
                        //we then collect the number of posts of all the users the user follows
                    result.following.map(follower => {
                        get_user(follower, "id").then(
                            follower_data => follower_data.json().then(
                                r => {
                                    //the first run creating the follower_post object
                                    if (count < following_count) {
                                        follower_posts[r.username] = r.posts.length
                                        count += 1

                                    } else {
                                        console.log(follower_posts[r.username], r.posts.length, "check")
                                            //if there is a change in posts the user is notifed
                                        if (follower_posts[r.username] != r.posts.length) {
                                            const notif = document.createElement("h3")
                                            notif.innerText = `${r.username} made a new post!  `
                                            const close_button = document.createElement("button")

                                            //adding an event listener that deletes the notification
                                            close_button.addEventListener("click", () => {
                                                notif_div.removeChild(notif)
                                                if (!notif_div.hasChildNodes()) {
                                                    notif_div.style.display = "none"
                                                }
                                            })

                                            close_button.innerText = "Close"
                                            notif.appendChild(close_button)

                                            document.getElementById("notifications").appendChild(notif)
                                            follower_posts[r.username] = r.posts.length
                                            notif_div.style.display = "block"
                                        }
                                    }
                                }
                            )
                        )
                    })
                }
            )
        )
    }
    console.log(follower_posts)
}, 5000); // Poll every 5 seconds