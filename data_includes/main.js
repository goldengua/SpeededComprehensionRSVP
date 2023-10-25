PennController.ResetPrefix(null) // Shorten command names (keep this line here))
Header(
// void
)
.log( "PROLIFIC_ID" , GetURLParameter("id") )
// Start with welcome screen, then present test trials in a random order,
// and show the final screen after sending the results
Sequence( "consent", "welcome", "practice_intro", "practice","experiment_intro", randomize("experiment"), "send" ,"exit", "final" )

//Sequence( "welcome" , "practice" , randomize("test") , "send" ,"exit", "final" )

Header( /* void */ )
    // This .log command will apply to all trials
    .log( "ID" , GetURLParameter("id") ) // Append the "ID" URL parameter to each result line

 newTrial("consent",
    newHtml("consent.html")
        .print()
        .cssContainer({"font-size": "150%",})
    ,
    newButton("I consent")
        .print()
        .cssContainer({"font-size": "150%",})
        .size(100, 60)
        .settings.css("font-size", "20px")
        .center()
        .wait()
     )
     

newTrial("intro",
    newHtml("intro", "intro.html")
        .print()
        .log()
    ,
    newButton("continue", "Click to continue")
        .center()
        .print()
        .wait(getHtml("intro").test.complete()
.failure(getHtml("intro").warn())
        )
)

 newTrial("welcome",
    newHtml("intro2.html").print()
        .cssContainer({"font-size": "120%",        })
    ,
    newKey(" ").wait()
     )
     

Template( "practice.csv" , 
    row => newTrial( "practice" ,   
        // Display all Text elements centered on the page, and log their display time code
        newText("practice").color("blue").print("center at 50vw","top at 1em")
        ,
        defaultText.center().print("center at 50vw","middle at 50vh").log()
        ,
        // Automatically start and wait for Timer elements when created, and log those events
        defaultTimer.log().start().wait()
        ,
        // Mask, shown on screen for 500ms
        newText("mask","######"),
        newTimer("maskTimer", 500),                       
        getText("mask").remove()
        ,
        // Prime, shown on screen for 42ms
        newController("DashedSentence", {s: row.sentence, mode: "speeded acceptability","speed": row.speed,
            display: "in place", wordTime: 190, wordPauseTime: 100})
        .print("center at 50vw","middle at 50vh")
        .cssContainer({"font-size": "300%",        })
        .log()
        .wait()
        .remove()
        ,
        
      // Target, shown on screen until F or J is pressed
        newText("question",row.question)
        ,
        // Use a tooltip to give instructions
        newTooltip("guide", "Now press F for Yes, J for No")
            .position("bottom center")  // Display it below the element it attaches to
            .key("", "no click")        // Prevent from closing the tooltip (no key, no click)
            .print(getText("question"))   // Attach to the "target" Text element
        ,
        newKey("answerTarget", "FJ") // Only proceed after a keypress on F or J
            .wait() 
            .log()
            .test.pressed(row.key)      // Set the "guide" Tooltip element's feedback text accordingly
            .success( getTooltip("guide").text("<p>Congratulations! This is correct.</p>") )
            .failure( getTooltip("guide").text("<p>Oops. This is not the right answer.</p>") )
        ,
        getText("question")
            .text(row.sentence,'<p> </p>')
        ,
        getTooltip("guide")
            .label("Press SPACE to the next trial")  // Add a label to the bottom-right corner
            .key(" ")                       // Pressing Space will close the tooltip
            .wait()                         // Proceed only when the tooltip is closed
        ,
        getText("question").remove()        // End of trial, remove "target"
    )
    .log( "Item", row.item)
    .log( "Type" , row.type)  // Append condition (tr. v op. v fi.) to each result line
    .log( "Condition", row.condition ) // Append prime type (rel. vs unr.) to each result line
    .log( "Sentence", row.sentence)
    .log('Question',row.question)
    .log( "CorrectAnswer"  , row.answer )  // Append expectped (f vs j) to each result line
    .log("Speed", row.speed)
)


newTrial( "experiment_intro" ,
    defaultText.center().print()
    ,
    newText("<p>Now let us start with the real experiment. </p>")
    ,
    newText("<p>When you are ready, press SPACE to begin the real experiment. </p>")
    ,
    newKey(" ").wait() 
)
// Executing experiment from list.csv table, where participants are divided into two groups (A vs B)
Template( "stimuli_latin.csv" , 
    row => newTrial( "experiment" ,   
        // Display all Text elements centered on the page, and log their display time code
        defaultText.center().print("center at 50vw","middle at 50vh").log()
        ,
        // Automatically start and wait for Timer elements when created, and log those events
        defaultTimer.log().start().wait()
        ,
        // Mask, shown on screen for 500ms
        newText("mask","######"),
        newTimer("maskTimer", 500),                       
        getText("mask").remove()
        ,
        // Prime, shown on screen for 42ms
        newController("DashedSentence", {s: row.sentence, mode: "speeded acceptability", speed: row.speed,
            display: "in place", wordTime: 50, wordPauseTime: 100})
        .print("center at 50vw","middle at 50vh")
        .cssContainer({"font-size": "300%",        })
        .log()
        .wait()
        .remove()
        ,
        
        newVar("RT").global().set( v => Date.now() )
        ,
       // Target, shown on screen until F or J is pressed
        newText("question",row.question)
        ,
        // Use a tooltip to give instructions
        newTooltip("guide", "Now press F for Yes, J for No")
            .position("bottom center")  // Display it below the element it attaches to
            .key("", "no click")        // Prevent from closing the tooltip (no key, no click)
            .print(getText("question"))   // Attach to the "target" Text element
        ,
        newKey("answerTarget", "FJ") // Only proceed after a keypress on F or J
            .wait() 
            .log()
            .test.pressed()      // Set the "guide" Tooltip element's feedback text accordingly
            .success( getTooltip("guide").text("<p>Press SPACE to the next trial.</p>") )
            .failure( getTooltip("guide").text("<p>Please make a choice.</p>") )
        ,

        getVar("RT").set( v => Date.now() - v )
        ,
     getTooltip('guide').remove(),
        getText("question").remove(),        // End of trial, remove "target"
        newTimer(100).start().wait()
        ,
        newText('1').text("Your reaction time (ms) is: ").print(),
        newText('2' ).text(getVar("RT") ).print().color('blue'),
        newText("Press SPACE to the next trial.").print(),
        newKey(" ").wait()
        
    )
    .log( "Group"     , row.group)      // Append group (A vs B) to each result line
    .log( "Item", row.item)
    .log( "Type" , row.type)  // Append condition (tr. v op. v fi.) to each result line
    .log( "Condition", row.condition ) // Append prime type (rel. vs unr.) to each result line
    .log( "Sentence", row.sentence)
    .log('Question',row.question)
    .log( "CorrectAnswer"  , row.answer )  // Append expectped (f vs j) to each result line
    .log("Speed", row.speed)
    .log('RT',getVar('RT'))

)

newTrial( "exit" ,
       newText("<p>Thank you for your participation!</p>")
           .center()
           .print()
       ,
      // This is where you should put the link from the last step.
       newText("<p><a href='https://app.prolific.co/submissions/complete?cc=CODE'>Click here to validate your submission</a></p>")
           .center()
           .print()
       ,
       newButton("void")
           .wait()
   )
// Send the results
SendResults("send")

// A simple final screen
newTrial ( "final" ,
    newText("The experiment is over. Thank you for participating!")
        .print()
    ,
    newText("You can now close this page.")
        .print()
    ,
    // Stay on this page forever
    newButton().wait()
)
