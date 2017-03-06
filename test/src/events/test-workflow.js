var project = null;
var workflow = null;
describe('Workflow', function()
{
    before(function(done) { setupWorkflow(done); });
    after(ensureDeinitialization);
    var requests = [rodan.events.REQUEST__WORKFLOW_CREATE,
    				rodan.events.REQUEST__WORKFLOW_DELETE,
    				rodan.events.REQUEST__WORKFLOW_SAVE];
    describe(requests.join(', '), function()
    {
        it(rodan.events.EVENT__WORKFLOW_CREATED, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__WORKFLOW_CREATED, function(options)
            {
            	workflow = options.workflow;
            	assert.instanceOf(workflow, rodan.Workflow);
                done(); 
            });
            rodan.channel.request(rodan.events.REQUEST__WORKFLOW_CREATE, {project: project});
        });

        var randomName = 'newname' + createRandomId().toString();
        it(rodan.events.EVENT__WORKFLOW_SAVED, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__WORKFLOW_SAVED, function(options)
            {
            	workflow = options.workflow;
            	assert.equal(randomName, workflow.get('name'));
                done(); 
            });
            rodan.channel.request(rodan.events.REQUEST__WORKFLOW_SAVE, {workflow: workflow, fields: {name: randomName}});
        });

        it(rodan.events.REQUEST__WORKFLOW_DELETE, function(done)
        {
            rodan.channel.once(rodan.events.EVENT__WORKFLOW_DELETED, function(options)
            {
                done(); 
            });
            rodan.channel.request(rodan.events.REQUEST__WORKFLOW_DELETE, {workflow: workflow});
        });

        it(rodan.events.REQUEST__WORKFLOW_EXPORT);
        it(rodan.events.REQUEST__WORKFLOW_IMPORT);
    });
});

function setupWorkflow(done)
{
	ensureInitializationAndLogin(function()
	{
    	rodan.channel.once(rodan.events.EVENT__PROJECT_CREATED, function(options)
    	{
    		project = options.project;
    		done();
    	});
    	var user = rodan.channel.request(rodan.events.REQUEST__AUTHENTICATION_USER);
        rodan.channel.request(rodan.events.REQUEST__PROJECT_CREATE, {user: user});
	});
}