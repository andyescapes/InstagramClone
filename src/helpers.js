/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */

import {
    unfollow_user,
    follow_user
} from './api.js';

import { error } from "./main.js"

export function fileToDataUrl(file) {
    if (!file) {
        error("Please upload an image to post")
    }
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        error('provided file is not a png, jpg or jpeg image.')
        throw Error('provided file is not a png, jpg or jpeg image.');
    }

    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

//clearing/resetting dom elements from the profile view
export const clear_profile = () => {
    const profile_posts = document.getElementById("profile_view_posts")
    const following_list = document.getElementById("following_list")
    const find_friends = document.getElementById("find_friends")
    while (profile_posts.hasChildNodes()) {
        profile_posts.removeChild(profile_posts.lastChild);
    }
    while (following_list.hasChildNodes()) {
        following_list.removeChild(following_list.lastChild);
    }
    while (find_friends.hasChildNodes()) {
        find_friends.removeChild(find_friends.lastChild);
    }
}

//clearing dom elements from the feed
export const clear_feed = () => {
    const feed = document.getElementById("feed")
    while (feed.hasChildNodes()) {
        if (feed.lastChild.id == "notifications") break
        feed.removeChild(feed.lastChild);
    }
}

//adding the ability to edit a user's post
export let add_post_editing_for_profile_view = (my_profile, div, id, id_to_update, delete_post, token) => {
    if (my_profile == true) {
        const delete_button = document.createElement("button")
        const edit_button = document.createElement("button")
        delete_button.innerText = "Delete"
        edit_button.innerText = "Edit"

        delete_button.addEventListener('click', () => {
            delete_post(id, token)
            div.style.display = "none"
        })
        edit_button.addEventListener('click', () => {
            document.getElementById("update_modal").style.display = "block"
            id_to_update.id = id
        })
        document.getElementById("exit_update_modal").addEventListener('click', (event) => {
            document.getElementById("update_modal").style.display = "none"
        })

        //creating a div for the edit and delete buttons
        const button_div = document.createElement("div")
        button_div.appendChild(delete_button)
        button_div.appendChild(edit_button)
        div.appendChild(button_div)
    }

}

//creates a follower suggester for users who want to follow others
export let add_follower_suggester = (div_to_append, my_profile, res, get_user, token) => {
    if (my_profile == true) {
        div_to_append.className = "post"

        //picks 3 random users to suggest to the user
        for (let i = 0; i < 3; i++) {
            const random = Math.floor(Math.random() * 20) + 1
            const h4 = document.createElement("h4")

            //if the user already follows the suggestion, the suggestion is omitted
            if (!res.following.includes(random)) {
                get_user(random, "id").then(
                    data => data.json()
                    .then(username => {

                        const new_div = document.createElement("div")
                        h4.innerText = username.username
                        h4.className = "profile_font"

                        const follow_button = document.createElement("button")
                        follow_button.innerText = "Follow"

                        //giving the user the ability to follow the recommendation
                        follow_button.addEventListener('click', () => {
                            follow_user(token, username.username)
                            new_div.style.display = "none"
                        })

                        //appending new dom elements to the eventual passed in div
                        new_div.appendChild(h4)
                        new_div.appendChild(follow_button)
                        document.getElementById("friend_message").appendChild(new_div)
                    })
                )
            }

        }
        const enter_name = document.createElement("h4")
        enter_name.innerText = "Or enter their username below:"
        const username_input = document.createElement("input")
        const follow_button = document.createElement("button")
        follow_button.innerText = "Follow"

        follow_button.addEventListener('click', () => {
            follow_user(token, username_input.value)
        })
        div_to_append.appendChild(enter_name)
        div_to_append.appendChild(username_input)
        div_to_append.appendChild(follow_button)
    }
}

//adds a button to post a comment
export let add_comment_button_handler = (comment_submit, comment_input, comment_no, post_comment, id, token, comment_list) => {
    comment_submit.addEventListener("click", () => {
        post_comment(id, token, comment_input.value)
        const temp = document.createElement("h6")
        temp.innerText = comment_input.value

        //we change the comment number count and the list of comments
        //this allows us live comment updates (for the users own comments)
        if (comment_input.value) {
            comment_list.appendChild(temp)
            const comment_number = comment_no.innerText.slice(comment_no.innerText.length - 1)
            comment_no.innerText = `Comments: ${parseInt(comment_number) + 1}`
        }

    })
}

//creating a list of users who have liked a post
export let add_like_list = (likes, like_list, get_user) => {
    //translating the user id to their actual username
    likes.map(liker => get_user(liker, "id").then(
        (data) => data.json()
        .then(
            user => {
                console.log(user.username)
                const like_user = document.createElement("h6")

                like_user.innerText = user.username
                like_list.appendChild(like_user)
            }
        )
    ))
}

//creating a like button that updates the like list and number live
export let add_like_button = (like_post, get_post, id, token, like_count, like_list, get_user) => {
    const like_button = document.createElement("button")
    like_button.innerText = "Like"
    like_button.addEventListener('click', (event) => {
        like_post(id, token)
        const post_get = () => {
                get_post(id, token).then(
                    data => data.json().then(
                        res => {
                            like_count.innerText = `Likes: ${res.meta.likes.length}`
                            while (like_list.hasChildNodes()) {
                                like_list.removeChild(like_list.lastChild)
                            }
                            add_like_list(res.meta.likes, like_list, get_user)
                        }
                    )
                )
            }
            //time out to ensure like is added before we get posts
        setTimeout(post_get, 250)
    })
    return like_button
}